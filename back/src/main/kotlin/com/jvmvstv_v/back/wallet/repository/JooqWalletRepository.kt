package com.jvmvstv_v.back.wallet.repository

import com.jvmvstv_v.back.letters.repository.LetterRepository
import com.jvmvstv_v.back.user.repository.UserRepository
import com.jvmvstv_v.back.wallet.model.BillingPeriod
import com.jvmvstv_v.back.wallet.model.PaymentMethod
import com.jvmvstv_v.back.wallet.model.PlanSubscription
import com.jvmvstv_v.back.wallet.model.SubscriptionMember
import com.jvmvstv_v.back.wallet.model.SubscriptionMemberRole
import com.jvmvstv_v.back.wallet.model.SubscriptionPlan
import com.jvmvstv_v.back.wallet.model.SubscriptionStatus
import com.jvmvstv_v.back.wallet.model.UserMonthlyAllowance
import com.jvmvstv_v.back.wallet.model.Wallet
import com.jvmvstv_v.back.wallet.model.WalletTransaction
import com.jvmvstv_v.back.wallet.model.WalletTransactionStatus
import com.jvmvstv_v.back.wallet.model.WalletTransactionType
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqWalletRepository(
    private val dsl: DSLContext,
    private val userRepository: UserRepository,
    private val letterRepository: LetterRepository,
) : WalletRepository {
    private val WALLETS = DSL.table("wallets")
    private val W_ID = DSL.field("id", SQLDataType.UUID)
    private val W_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val W_BALANCE_MINOR = DSL.field("balance_minor", SQLDataType.INTEGER)
    private val W_CURRENCY = DSL.field("currency", SQLDataType.VARCHAR)
    private val W_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val W_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val W_STRIPE_CUSTOMER_ID = DSL.field("stripe_customer_id", SQLDataType.VARCHAR)

    private val TRANSACTIONS = DSL.table("wallet_transactions")
    private val TX_ID = DSL.field("id", SQLDataType.UUID)
    private val TX_WALLET_ID = DSL.field("wallet_id", SQLDataType.UUID)
    private val TX_AMOUNT_MINOR = DSL.field("amount_minor", SQLDataType.INTEGER)
    private val TX_CURRENCY = DSL.field("currency", SQLDataType.VARCHAR)
    private val TX_TYPE = DSL.field("type", SQLDataType.VARCHAR)
    private val TX_STATUS = DSL.field("status", SQLDataType.VARCHAR)
    private val TX_LETTER_ID = DSL.field("letter_id", SQLDataType.UUID)
    private val TX_EXTERNAL_REF = DSL.field("external_ref", SQLDataType.VARCHAR)
    private val TX_DESCRIPTION = DSL.field("description", SQLDataType.VARCHAR)
    private val TX_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val TX_SETTLED_AT = DSL.field("settled_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val PLANS = DSL.table("subscription_plans")
    private val P_ID = DSL.field("id", SQLDataType.INTEGER)
    private val P_CODE = DSL.field("code", SQLDataType.VARCHAR)
    private val P_NAME = DSL.field("name", SQLDataType.VARCHAR)
    private val P_DESCRIPTION = DSL.field("description", SQLDataType.VARCHAR)
    private val P_PRICE_MINOR = DSL.field("price_minor", SQLDataType.INTEGER)
    private val P_CURRENCY = DSL.field("currency", SQLDataType.VARCHAR)
    private val P_BILLING_PERIOD = DSL.field("billing_period", SQLDataType.VARCHAR)
    private val P_ACTIVE = DSL.field("active", SQLDataType.BOOLEAN)
    private val P_SEND_PER_MONTH = DSL.field("letters_send_per_month", SQLDataType.INTEGER)
    private val P_RECEIVE_PER_MONTH = DSL.field("letters_receive_per_month", SQLDataType.INTEGER)
    private val P_ADDRESS_ALLOWANCE = DSL.field("address_allowance", SQLDataType.INTEGER)
    private val P_MAX_MEMBERS = DSL.field("max_members", SQLDataType.INTEGER)

    private val PLAN_COLUMNS = listOf(P_ID, P_CODE, P_NAME, P_DESCRIPTION, P_PRICE_MINOR, P_CURRENCY,
        P_BILLING_PERIOD, P_ACTIVE, P_SEND_PER_MONTH, P_RECEIVE_PER_MONTH, P_ADDRESS_ALLOWANCE, P_MAX_MEMBERS)

    private val SUBSCRIPTIONS = DSL.table("subscriptions")
    private val S_ID = DSL.field("id", SQLDataType.UUID)
    private val S_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val S_PLAN_ID = DSL.field("plan_id", SQLDataType.INTEGER)
    private val S_STATUS = DSL.field("status", SQLDataType.VARCHAR)
    private val S_STARTED_AT = DSL.field("started_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val S_PERIOD_START = DSL.field("current_period_start", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val S_PERIOD_END = DSL.field("current_period_end", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val S_CANCELLED_AT = DSL.field("cancelled_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val S_EXTERNAL_REF = DSL.field("external_ref", SQLDataType.VARCHAR)
    private val S_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val S_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val S_STRIPE_SUBSCRIPTION_ID = DSL.field("stripe_subscription_id", SQLDataType.VARCHAR)
    private val S_AUTO_RENEW = DSL.field("auto_renew", SQLDataType.BOOLEAN)

    private val SUB_COLUMNS = listOf(S_ID, S_USER_ID, S_PLAN_ID, S_STATUS, S_STARTED_AT, S_PERIOD_START, S_PERIOD_END,
        S_CANCELLED_AT, S_EXTERNAL_REF, S_AUTO_RENEW, S_CREATED_AT, S_UPDATED_AT)

    private val MEMBERS = DSL.table("subscription_members")
    private val M_SUBSCRIPTION_ID = DSL.field("subscription_id", SQLDataType.UUID)
    private val M_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val M_ROLE = DSL.field("role", SQLDataType.VARCHAR)
    private val M_IS_MINOR = DSL.field("is_minor", SQLDataType.BOOLEAN)
    private val M_ADDED_AT = DSL.field("added_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val M_REMOVED_AT = DSL.field("removed_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val ALLOWANCES = DSL.table("user_monthly_allowances")
    private val AL_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val AL_PERIOD = DSL.field("period", SQLDataType.LOCALDATE)
    private val AL_LETTERS_SENT = DSL.field("letters_sent", SQLDataType.INTEGER)
    private val AL_LETTERS_RECEIVED = DSL.field("letters_received", SQLDataType.INTEGER)
    private val AL_ADDRESSES_UNLOCKED = DSL.field("addresses_unlocked", SQLDataType.INTEGER)
    private val AL_BONUS_SEND = DSL.field("bonus_send_quota", SQLDataType.INTEGER)
    private val AL_BONUS_RECEIVE = DSL.field("bonus_receive_quota", SQLDataType.INTEGER)
    private val AL_BONUS_ADDRESSES = DSL.field("bonus_addresses", SQLDataType.INTEGER)
    private val AL_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val AL_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val PAYMENT_METHODS = DSL.table("payment_methods")
    private val PM_ID = DSL.field("id", SQLDataType.UUID)
    private val PM_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val PM_STRIPE_ID = DSL.field("stripe_payment_method_id", SQLDataType.VARCHAR)
    private val PM_BRAND = DSL.field("brand", SQLDataType.VARCHAR)
    private val PM_LAST4 = DSL.field("last4", SQLDataType.VARCHAR)
    private val PM_EXP_MONTH = DSL.field("exp_month", SQLDataType.INTEGER)
    private val PM_EXP_YEAR = DSL.field("exp_year", SQLDataType.INTEGER)
    private val PM_IS_DEFAULT = DSL.field("is_default", SQLDataType.BOOLEAN)
    private val PM_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val PM_REMOVED_AT = DSL.field("removed_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val PM_COLUMNS = listOf(PM_ID, PM_BRAND, PM_LAST4, PM_EXP_MONTH, PM_EXP_YEAR, PM_IS_DEFAULT, PM_CREATED_AT)

    override fun findWalletForUser(userId: UUID): Wallet? =
        dsl.select(W_ID, W_USER_ID, W_BALANCE_MINOR, W_CURRENCY, W_CREATED_AT, W_UPDATED_AT)
            .from(WALLETS)
            .where(W_USER_ID.eq(userId))
            .fetchOne { toWallet(it) }

    override fun findPlans(): List<SubscriptionPlan> =
        dsl.select(PLAN_COLUMNS).from(PLANS).orderBy(P_PRICE_MINOR).fetch { toPlan(it) }

    override fun findSubscriptionForUser(userId: UUID): PlanSubscription? =
        dsl.select(SUB_COLUMNS).from(SUBSCRIPTIONS)
            .where(S_USER_ID.eq(userId)).and(S_STATUS.`in`(SubscriptionStatus.ACTIVE.name, SubscriptionStatus.PAST_DUE.name))
            .fetchOne { toSubscription(it) }

    override fun findMonthlyAllowanceForUser(userId: UUID): UserMonthlyAllowance? {
        val period = LocalDate.now().withDayOfMonth(1)
        return dsl.select(AL_USER_ID, AL_PERIOD, AL_LETTERS_SENT, AL_LETTERS_RECEIVED, AL_ADDRESSES_UNLOCKED,
            AL_BONUS_SEND, AL_BONUS_RECEIVE, AL_BONUS_ADDRESSES, AL_CREATED_AT, AL_UPDATED_AT)
            .from(ALLOWANCES)
            .where(AL_USER_ID.eq(userId)).and(AL_PERIOD.eq(period))
            .fetchOne { toAllowance(it) }
    }

    override fun initiateTopUp(userId: UUID, amountMinor: Int, currency: String): WalletTransaction {
        val walletId = findOrCreateWallet(userId)
        val id = UUID.randomUUID()
        dsl.insertInto(TRANSACTIONS)
            .columns(TX_ID, TX_WALLET_ID, TX_AMOUNT_MINOR, TX_CURRENCY, TX_TYPE, TX_STATUS, TX_CREATED_AT)
            .values(id, walletId, amountMinor, currency, WalletTransactionType.TOP_UP.name,
                WalletTransactionStatus.PENDING.name, OffsetDateTime.now())
            .execute()
        return findTransactionById(id) ?: error("Wallet transaction $id not found")
    }

    override fun subscribeToPlan(userId: UUID, planId: Int): PlanSubscription {
        val plan = findPlanById(planId) ?: error("Subscription plan $planId not found")
        val id = UUID.randomUUID()
        val now = OffsetDateTime.now()
        val periodEnd = if (plan.billingPeriod == BillingPeriod.YEARLY) now.plusYears(1) else now.plusMonths(1)
        dsl.insertInto(SUBSCRIPTIONS)
            .columns(S_ID, S_USER_ID, S_PLAN_ID, S_STATUS, S_STARTED_AT, S_PERIOD_START, S_PERIOD_END,
                S_CREATED_AT, S_UPDATED_AT)
            .values(id, userId, planId, SubscriptionStatus.ACTIVE.name, now, now, periodEnd, now, now)
            .execute()
        dsl.insertInto(MEMBERS)
            .columns(M_SUBSCRIPTION_ID, M_USER_ID, M_ROLE, M_ADDED_AT)
            .values(id, userId, SubscriptionMemberRole.OWNER.name, now)
            .execute()
        return findSubscriptionById(id) ?: error("Subscription $id not found")
    }

    override fun cancelSubscription(id: UUID): PlanSubscription {
        dsl.update(SUBSCRIPTIONS)
            .set(S_STATUS, SubscriptionStatus.CANCELLED.name)
            .set(S_CANCELLED_AT, OffsetDateTime.now())
            .set(S_UPDATED_AT, OffsetDateTime.now())
            .where(S_ID.eq(id))
            .execute()
        return findSubscriptionById(id) ?: error("Subscription $id not found")
    }

    override fun addSubscriptionMember(subscriptionId: UUID, userId: UUID, isMinor: Boolean): SubscriptionMember {
        dsl.insertInto(MEMBERS)
            .columns(M_SUBSCRIPTION_ID, M_USER_ID, M_ROLE, M_IS_MINOR, M_ADDED_AT)
            .values(subscriptionId, userId, SubscriptionMemberRole.MEMBER.name, isMinor, OffsetDateTime.now())
            .execute()
        return findMember(subscriptionId, userId) ?: error("Subscription member not found")
    }

    override fun removeSubscriptionMember(subscriptionId: UUID, userId: UUID): SubscriptionMember {
        dsl.update(MEMBERS)
            .set(M_REMOVED_AT, OffsetDateTime.now())
            .where(M_SUBSCRIPTION_ID.eq(subscriptionId)).and(M_USER_ID.eq(userId))
            .execute()
        return findMember(subscriptionId, userId) ?: error("Subscription member not found")
    }

    override fun updateAutoRenew(subscriptionId: UUID, autoRenew: Boolean): PlanSubscription {
        dsl.update(SUBSCRIPTIONS)
            .set(S_AUTO_RENEW, autoRenew)
            .set(S_UPDATED_AT, OffsetDateTime.now())
            .where(S_ID.eq(subscriptionId))
            .execute()
        return findSubscriptionById(subscriptionId) ?: error("Subscription $subscriptionId not found")
    }

    override fun findStripeSubscriptionId(subscriptionId: UUID): String? =
        dsl.select(S_STRIPE_SUBSCRIPTION_ID).from(SUBSCRIPTIONS).where(S_ID.eq(subscriptionId))
            .fetchOne(S_STRIPE_SUBSCRIPTION_ID)

    override fun ensureStripeCustomerId(userId: UUID, create: () -> String): String {
        findOrCreateWallet(userId)
        val existing = dsl.select(W_STRIPE_CUSTOMER_ID).from(WALLETS).where(W_USER_ID.eq(userId))
            .fetchOne(W_STRIPE_CUSTOMER_ID)
        if (existing != null) return existing
        val created = create()
        dsl.update(WALLETS).set(W_STRIPE_CUSTOMER_ID, created).where(W_USER_ID.eq(userId)).execute()
        return created
    }

    override fun findPaymentMethodsForUser(userId: UUID): List<PaymentMethod> =
        dsl.select(PM_COLUMNS).from(PAYMENT_METHODS)
            .where(PM_USER_ID.eq(userId)).and(PM_REMOVED_AT.isNull)
            .orderBy(PM_IS_DEFAULT.desc(), PM_CREATED_AT)
            .fetch { toPaymentMethod(it) }

    override fun findPaymentMethodById(id: UUID): PaymentMethod? =
        dsl.select(PM_COLUMNS).from(PAYMENT_METHODS).where(PM_ID.eq(id)).fetchOne { toPaymentMethod(it) }

    override fun savePaymentMethod(
        userId: UUID,
        stripePaymentMethodId: String,
        brand: String?,
        last4: String?,
        expMonth: Int?,
        expYear: Int?,
    ): PaymentMethod {
        val id = UUID.randomUUID()
        val hasExisting = dsl.selectOne().from(PAYMENT_METHODS)
            .where(PM_USER_ID.eq(userId)).and(PM_REMOVED_AT.isNull)
            .fetchOne() != null
        dsl.insertInto(PAYMENT_METHODS)
            .columns(PM_ID, PM_USER_ID, PM_STRIPE_ID, PM_BRAND, PM_LAST4, PM_EXP_MONTH, PM_EXP_YEAR, PM_IS_DEFAULT,
                PM_CREATED_AT)
            .values(id, userId, stripePaymentMethodId, brand, last4, expMonth, expYear, !hasExisting,
                OffsetDateTime.now())
            .execute()
        return findPaymentMethodById(id) ?: error("Payment method $id not found")
    }

    override fun removePaymentMethod(id: UUID): Boolean =
        dsl.update(PAYMENT_METHODS).set(PM_REMOVED_AT, OffsetDateTime.now())
            .where(PM_ID.eq(id)).and(PM_REMOVED_AT.isNull)
            .execute() > 0

    override fun findStripePaymentMethodId(id: UUID): String? =
        dsl.select(PM_STRIPE_ID).from(PAYMENT_METHODS).where(PM_ID.eq(id)).fetchOne(PM_STRIPE_ID)

    private fun toPaymentMethod(record: Record): PaymentMethod = PaymentMethod(
        id = record[PM_ID]!!,
        brand = record[PM_BRAND],
        last4 = record[PM_LAST4],
        expMonth = record[PM_EXP_MONTH],
        expYear = record[PM_EXP_YEAR],
        isDefault = record[PM_IS_DEFAULT]!!,
        createdAt = record[PM_CREATED_AT]!!.toString(),
    )

    private fun findOrCreateWallet(userId: UUID): UUID {
        val existing = dsl.select(W_ID).from(WALLETS).where(W_USER_ID.eq(userId)).fetchOne(W_ID)
        if (existing != null) return existing
        val id = UUID.randomUUID()
        val now = OffsetDateTime.now()
        dsl.insertInto(WALLETS)
            .columns(W_ID, W_USER_ID, W_CREATED_AT, W_UPDATED_AT)
            .values(id, userId, now, now)
            .execute()
        return id
    }

    private fun findPlanById(id: Int): SubscriptionPlan? =
        dsl.select(PLAN_COLUMNS).from(PLANS).where(P_ID.eq(id)).fetchOne { toPlan(it) }

    private fun findSubscriptionById(id: UUID): PlanSubscription? =
        dsl.select(SUB_COLUMNS).from(SUBSCRIPTIONS).where(S_ID.eq(id)).fetchOne { toSubscription(it) }

    private fun findTransactionById(id: UUID): WalletTransaction? =
        dsl.select(TX_ID, TX_AMOUNT_MINOR, TX_CURRENCY, TX_TYPE, TX_STATUS, TX_LETTER_ID, TX_EXTERNAL_REF,
            TX_DESCRIPTION, TX_CREATED_AT, TX_SETTLED_AT)
            .from(TRANSACTIONS)
            .where(TX_ID.eq(id))
            .fetchOne { toTransaction(it) }

    private fun findTransactionsForWallet(walletId: UUID): List<WalletTransaction> =
        dsl.select(TX_ID, TX_AMOUNT_MINOR, TX_CURRENCY, TX_TYPE, TX_STATUS, TX_LETTER_ID, TX_EXTERNAL_REF,
            TX_DESCRIPTION, TX_CREATED_AT, TX_SETTLED_AT)
            .from(TRANSACTIONS)
            .where(TX_WALLET_ID.eq(walletId))
            .orderBy(TX_CREATED_AT.desc())
            .fetch { toTransaction(it) }

    private fun findMembersForSubscription(subscriptionId: UUID): List<SubscriptionMember> =
        dsl.select(M_USER_ID, M_ROLE, M_IS_MINOR, M_ADDED_AT, M_REMOVED_AT)
            .from(MEMBERS)
            .where(M_SUBSCRIPTION_ID.eq(subscriptionId))
            .fetch { toMember(subscriptionId, it) }

    private fun findMember(subscriptionId: UUID, userId: UUID): SubscriptionMember? =
        dsl.select(M_USER_ID, M_ROLE, M_IS_MINOR, M_ADDED_AT, M_REMOVED_AT)
            .from(MEMBERS)
            .where(M_SUBSCRIPTION_ID.eq(subscriptionId)).and(M_USER_ID.eq(userId))
            .fetchOne { toMember(subscriptionId, it) }

    private fun toWallet(record: Record): Wallet {
        val id = record[W_ID]!!
        return Wallet(
            id = id,
            user = userRepository.findById(record[W_USER_ID]!!) ?: error("User not found"),
            balanceMinor = record[W_BALANCE_MINOR]!!,
            currency = record[W_CURRENCY]!!,
            createdAt = record[W_CREATED_AT]!!.toString(),
            updatedAt = record[W_UPDATED_AT]!!.toString(),
            transactions = findTransactionsForWallet(id),
        )
    }

    private fun toTransaction(record: Record): WalletTransaction = WalletTransaction(
        id = record[TX_ID]!!,
        amountMinor = record[TX_AMOUNT_MINOR]!!,
        currency = record[TX_CURRENCY]!!,
        type = WalletTransactionType.valueOf(record[TX_TYPE]!!),
        status = WalletTransactionStatus.valueOf(record[TX_STATUS]!!),
        letter = record[TX_LETTER_ID]?.let { letterRepository.findById(it) },
        externalRef = record[TX_EXTERNAL_REF],
        description = record[TX_DESCRIPTION],
        createdAt = record[TX_CREATED_AT]!!.toString(),
        settledAt = record[TX_SETTLED_AT]?.toString(),
    )

    private fun toPlan(record: Record): SubscriptionPlan = SubscriptionPlan(
        id = record[P_ID]!!,
        code = record[P_CODE]!!,
        name = record[P_NAME]!!,
        description = record[P_DESCRIPTION],
        priceMinor = record[P_PRICE_MINOR]!!,
        currency = record[P_CURRENCY]!!,
        billingPeriod = BillingPeriod.valueOf(record[P_BILLING_PERIOD]!!),
        active = record[P_ACTIVE]!!,
        lettersSendPerMonth = record[P_SEND_PER_MONTH]!!,
        lettersReceivePerMonth = record[P_RECEIVE_PER_MONTH]!!,
        addressAllowance = record[P_ADDRESS_ALLOWANCE]!!,
        maxMembers = record[P_MAX_MEMBERS]!!,
    )

    private fun toSubscription(record: Record): PlanSubscription {
        val id = record[S_ID]!!
        return PlanSubscription(
            id = id,
            user = userRepository.findById(record[S_USER_ID]!!) ?: error("User not found"),
            plan = findPlanById(record[S_PLAN_ID]!!) ?: error("Plan not found"),
            status = SubscriptionStatus.valueOf(record[S_STATUS]!!),
            startedAt = record[S_STARTED_AT]!!.toString(),
            currentPeriodStart = record[S_PERIOD_START]!!.toString(),
            currentPeriodEnd = record[S_PERIOD_END]!!.toString(),
            cancelledAt = record[S_CANCELLED_AT]?.toString(),
            externalRef = record[S_EXTERNAL_REF],
            autoRenew = record[S_AUTO_RENEW]!!,
            members = findMembersForSubscription(id),
            createdAt = record[S_CREATED_AT]!!.toString(),
            updatedAt = record[S_UPDATED_AT]!!.toString(),
        )
    }

    private fun toMember(subscriptionId: UUID, record: Record): SubscriptionMember = SubscriptionMember(
        subscription = findSubscriptionByIdShallow(subscriptionId),
        user = userRepository.findById(record[M_USER_ID]!!) ?: error("User not found"),
        role = SubscriptionMemberRole.valueOf(record[M_ROLE]!!),
        isMinor = record[M_IS_MINOR]!!,
        addedAt = record[M_ADDED_AT]!!.toString(),
        removedAt = record[M_REMOVED_AT]?.toString(),
    )

    private fun findSubscriptionByIdShallow(id: UUID): PlanSubscription =
        dsl.select(SUB_COLUMNS).from(SUBSCRIPTIONS).where(S_ID.eq(id)).fetchOne { record ->
            PlanSubscription(
                id = record[S_ID]!!,
                user = userRepository.findById(record[S_USER_ID]!!) ?: error("User not found"),
                plan = findPlanById(record[S_PLAN_ID]!!) ?: error("Plan not found"),
                status = SubscriptionStatus.valueOf(record[S_STATUS]!!),
                startedAt = record[S_STARTED_AT]!!.toString(),
                currentPeriodStart = record[S_PERIOD_START]!!.toString(),
                currentPeriodEnd = record[S_PERIOD_END]!!.toString(),
                cancelledAt = record[S_CANCELLED_AT]?.toString(),
                externalRef = record[S_EXTERNAL_REF],
                autoRenew = record[S_AUTO_RENEW]!!,
                members = emptyList(),
                createdAt = record[S_CREATED_AT]!!.toString(),
                updatedAt = record[S_UPDATED_AT]!!.toString(),
            )
        } ?: error("Subscription $id not found")

    private fun toAllowance(record: Record): UserMonthlyAllowance = UserMonthlyAllowance(
        user = userRepository.findById(record[AL_USER_ID]!!) ?: error("User not found"),
        period = record[AL_PERIOD]!!.toString(),
        lettersSent = record[AL_LETTERS_SENT]!!,
        lettersReceived = record[AL_LETTERS_RECEIVED]!!,
        addressesUnlocked = record[AL_ADDRESSES_UNLOCKED]!!,
        bonusSendQuota = record[AL_BONUS_SEND]!!,
        bonusReceiveQuota = record[AL_BONUS_RECEIVE]!!,
        bonusAddresses = record[AL_BONUS_ADDRESSES]!!,
        createdAt = record[AL_CREATED_AT]!!.toString(),
        updatedAt = record[AL_UPDATED_AT]!!.toString(),
    )
}
