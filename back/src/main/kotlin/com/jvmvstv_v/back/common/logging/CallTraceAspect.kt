package com.jvmvstv_v.back.common.logging

import com.jvmvstv_v.back.common.AuthException
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

private const val SLOW_CALL_MS = 1000L

// Traces every service and repository call, so a request can be followed down through the
// layers without sprinkling log statements everywhere. Each call is one line (DEBUG) with its
// duration. Only ids, numbers, booleans and enums are printed as arguments; strings are shown
// as their length and everything else as its type, since arguments can hold passwords, tokens,
// message text and base64 images. A call that fails is reported once, where it first failed
// (not again by every layer it propagates through); the full stack trace is logged separately
// by Spring GraphQL together with the executionId the client sees.
@Aspect
@Component
class CallTraceAspect {
    private val loggers = ConcurrentHashMap<Class<*>, Logger>()
    private val lastReported = ThreadLocal<Throwable?>()

    @Around(
        "execution(public * com.jvmvstv_v.back..service..*.*(..)) || " +
            "execution(public * com.jvmvstv_v.back..repository..*.*(..))",
    )
    fun trace(joinPoint: ProceedingJoinPoint): Any? {
        val startedAt = System.nanoTime()
        try {
            val result = joinPoint.proceed()
            report(joinPoint, startedAt, null)
            return result
        } catch (ex: Throwable) {
            report(joinPoint, startedAt, ex)
            throw ex
        }
    }

    private fun report(joinPoint: ProceedingJoinPoint, startedAt: Long, failure: Throwable?) {
        val tookMs = (System.nanoTime() - startedAt) / 1_000_000
        val logger = loggers.computeIfAbsent(joinPoint.target.javaClass) { LoggerFactory.getLogger(it) }
        if (failure != null) {
            if (lastReported.get() === failure) return
            lastReported.set(failure)
            val call = call(joinPoint)
            if (failure is AuthException) {
                logger.debug("{} rejected after {}ms: {}", call, tookMs, failure.message)
            } else {
                logger.warn("{} failed after {}ms: {}: {}", call, tookMs, failure.javaClass.simpleName, failure.message)
            }
            return
        }
        if (tookMs >= SLOW_CALL_MS) {
            logger.warn("{} was slow: {}ms", call(joinPoint), tookMs)
        } else if (logger.isDebugEnabled) {
            logger.debug("{} took {}ms", call(joinPoint), tookMs)
        }
    }

    private fun call(joinPoint: ProceedingJoinPoint): String =
        "${joinPoint.target.javaClass.simpleName}.${joinPoint.signature.name}(${joinPoint.args.joinToString(", ") { describe(it) }})"

    private fun describe(argument: Any?): String = when (argument) {
        null -> "null"
        is UUID, is Number, is Boolean, is Enum<*> -> argument.toString()
        is CharSequence -> "String[${argument.length}]"
        is ByteArray -> "bytes[${argument.size}]"
        is Collection<*> -> "${argument.javaClass.simpleName}[${argument.size}]"
        else -> argument.javaClass.simpleName
    }
}
