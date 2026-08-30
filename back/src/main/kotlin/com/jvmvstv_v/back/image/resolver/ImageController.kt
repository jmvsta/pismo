package com.jvmvstv_v.back.image.resolver

import com.jvmvstv_v.back.image.service.ImageService
import org.springframework.http.CacheControl
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID
import java.util.concurrent.TimeUnit

// A plain REST endpoint, not GraphQL: browsers request an <img src> directly,
// and streaming bytes through a GraphQL query would mean base64-inflating
// every image on every fetch instead of once, at upload time.
@RestController
@RequestMapping("/images")
class ImageController(private val imageService: ImageService) {
    @GetMapping("/{id}")
    fun get(@PathVariable id: UUID): ResponseEntity<ByteArray> {
        val image = imageService.get(id) ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(image.mimeType))
            .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic())
            .eTag(image.id.toString())
            .body(image.data)
    }
}
