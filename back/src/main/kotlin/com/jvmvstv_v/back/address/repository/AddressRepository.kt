package com.jvmvstv_v.back.address.repository

import com.jvmvstv_v.back.address.model.ConnectionAddressConsent
import com.jvmvstv_v.back.address.model.CreateAddressInput
import com.jvmvstv_v.back.address.model.UpdateAddressInput
import com.jvmvstv_v.back.address.model.UserAddress
import java.util.UUID

interface AddressRepository {
    fun findForUser(userId: UUID): List<UserAddress>
    fun findConsentsForConnection(connectionId: UUID): List<ConnectionAddressConsent>
    fun create(userId: UUID, input: CreateAddressInput): UserAddress
    fun update(id: UUID, input: UpdateAddressInput): UserAddress
    fun delete(id: UUID): Boolean
    fun grantConsent(connectionId: UUID, grantorId: UUID, addressId: UUID): ConnectionAddressConsent
    fun revokeConsent(connectionId: UUID, grantorId: UUID): ConnectionAddressConsent
}
