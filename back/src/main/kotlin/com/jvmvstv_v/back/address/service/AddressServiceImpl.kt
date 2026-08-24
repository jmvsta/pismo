package com.jvmvstv_v.back.address.service

import com.jvmvstv_v.back.address.model.ConnectionAddressConsent
import com.jvmvstv_v.back.address.model.CreateAddressInput
import com.jvmvstv_v.back.address.model.UpdateAddressInput
import com.jvmvstv_v.back.address.model.UserAddress
import com.jvmvstv_v.back.address.repository.AddressRepository
import com.jvmvstv_v.back.common.CurrentUser
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AddressServiceImpl(private val addressRepository: AddressRepository) : AddressService {
    override fun myAddresses(): List<UserAddress> = addressRepository.findForUser(CurrentUser.id)

    override fun consentsForConnection(connectionId: UUID): List<ConnectionAddressConsent> =
        addressRepository.findConsentsForConnection(connectionId)

    override fun createAddress(input: CreateAddressInput): UserAddress =
        addressRepository.create(CurrentUser.id, input)

    override fun updateAddress(id: UUID, input: UpdateAddressInput): UserAddress =
        addressRepository.update(id, input)

    override fun deleteAddress(id: UUID): Boolean = addressRepository.delete(id)

    override fun grantConsent(connectionId: UUID, addressId: UUID): ConnectionAddressConsent =
        addressRepository.grantConsent(connectionId, CurrentUser.id, addressId)

    override fun revokeConsent(connectionId: UUID): ConnectionAddressConsent =
        addressRepository.revokeConsent(connectionId, CurrentUser.id)
}
