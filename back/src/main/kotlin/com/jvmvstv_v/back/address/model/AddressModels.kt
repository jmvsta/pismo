package com.jvmvstv_v.back.address.model

import java.util.UUID

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
