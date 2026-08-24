package com.jvmvstv_v.back.address.model

import com.jvmvstv_v.back.matching.model.PenPalConnection
import com.jvmvstv_v.back.user.model.User
import java.util.UUID

enum class AddressConsentStatus { GRANTED, REVOKED }

data class UserAddress(
    val id: UUID,
    val recipientName: String,
    val streetLine1: String,
    val streetLine2: String?,
    val city: String,
    val region: String?,
    val postalCode: String?,
    val countryCode: String,
    val isPrimary: Boolean,
    val verifiedAt: String?,
    val createdAt: String,
    val updatedAt: String,
)

data class ConnectionAddressConsent(
    val id: UUID,
    val connection: PenPalConnection,
    val grantor: User,
    val address: UserAddress?,
    val status: AddressConsentStatus,
    val grantedAt: String,
    val revokedAt: String?,
)

data class CreateAddressInput(
    val recipientName: String,
    val streetLine1: String,
    val streetLine2: String?,
    val city: String,
    val region: String?,
    val postalCode: String?,
    val countryCode: String,
    val isPrimary: Boolean?,
)

data class UpdateAddressInput(
    val recipientName: String?,
    val streetLine1: String?,
    val streetLine2: String?,
    val city: String?,
    val region: String?,
    val postalCode: String?,
    val countryCode: String?,
    val isPrimary: Boolean?,
)
