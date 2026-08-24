package com.jvmvstv_v.back.address.service

import com.jvmvstv_v.back.address.model.ConnectionAddressConsent
import com.jvmvstv_v.back.address.model.CreateAddressInput
import com.jvmvstv_v.back.address.model.UpdateAddressInput
import com.jvmvstv_v.back.address.model.UserAddress
import java.util.UUID

interface AddressService {
    fun myAddresses(): List<UserAddress>
    fun consentsForConnection(connectionId: UUID): List<ConnectionAddressConsent>
    fun createAddress(input: CreateAddressInput): UserAddress
    fun updateAddress(id: UUID, input: UpdateAddressInput): UserAddress
    fun deleteAddress(id: UUID): Boolean
    fun grantConsent(connectionId: UUID, addressId: UUID): ConnectionAddressConsent
    fun revokeConsent(connectionId: UUID): ConnectionAddressConsent
}
