package com.jvmvstv_v.back.address.service

import com.jvmvstv_v.back.address.model.ConnectionAddressConsent
import com.jvmvstv_v.back.address.model.CreateAddressInput
import com.jvmvstv_v.back.address.model.UpdateAddressInput
import com.jvmvstv_v.back.address.model.UserAddress
import com.jvmvstv_v.back.address.repository.AddressRepository
import com.jvmvstv_v.back.common.CurrentUser
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AddressServiceImpl(private val addressRepository: AddressRepository) : AddressService {
    private val logger = LoggerFactory.getLogger(AddressServiceImpl::class.java)

    override fun myAddresses(): List<UserAddress> = addressRepository.findForUser(CurrentUser.id)

    override fun consentsForConnection(connectionId: UUID): List<ConnectionAddressConsent> =
        addressRepository.findConsentsForConnection(connectionId)

    override fun createAddress(input: CreateAddressInput): UserAddress {
        val created = addressRepository.create(CurrentUser.id, input)
        logger.info("User {} added address {}", CurrentUser.id, created.id)
        return created
    }

    override fun updateAddress(id: UUID, input: UpdateAddressInput): UserAddress {
        requireOwnAddress(id)
        val updated = addressRepository.update(id, input)
        logger.info("User {} updated address {}", CurrentUser.id, id)
        return updated
    }

    override fun deleteAddress(id: UUID): Boolean {
        requireOwnAddress(id)
        val deleted = addressRepository.delete(id)
        logger.info("User {} deleted address {}", CurrentUser.id, id)
        return deleted
    }

    private fun requireOwnAddress(id: UUID) {
        val owned = addressRepository.findForUser(CurrentUser.id).any { it.id == id }
        if (!owned) error("Address $id not found")
    }

    override fun grantConsent(connectionId: UUID, addressId: UUID): ConnectionAddressConsent {
        val consent = addressRepository.grantConsent(connectionId, CurrentUser.id, addressId)
        logger.info("User {} shared address {} with the other person in connection {}", CurrentUser.id, addressId, connectionId)
        return consent
    }

    override fun revokeConsent(connectionId: UUID): ConnectionAddressConsent {
        val consent = addressRepository.revokeConsent(connectionId, CurrentUser.id)
        logger.info("User {} stopped sharing their address in connection {}", CurrentUser.id, connectionId)
        return consent
    }
}
