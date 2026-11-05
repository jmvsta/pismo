package com.jvmvstv_v.back.address.service

import com.jvmvstv_v.back.address.model.CreateAddressInput
import com.jvmvstv_v.back.address.model.UpdateAddressInput
import com.jvmvstv_v.back.address.model.UserAddress
import com.jvmvstv_v.back.address.repository.AddressRepository
import com.jvmvstv_v.back.common.AuthException
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AddressServiceImpl(
    private val addressRepository: AddressRepository,
    private val matchingRepository: MatchingRepository,
) : AddressService {
    private val logger = LoggerFactory.getLogger(AddressServiceImpl::class.java)

    override fun myAddresses(): List<UserAddress> = addressRepository.findForUser(CurrentUser.id)

    override fun penPalAddress(connectionId: UUID): UserAddress? {
        val currentUserId = CurrentUser.id
        val connection = matchingRepository.findConnectionById(connectionId)
            ?: error("Connection $connectionId not found")
        val otherId = when (currentUserId) {
            connection.userA.id -> connection.userB.id
            connection.userB.id -> connection.userA.id
            else -> throw AuthException("You are not part of this connection")
        }
        val address = addressRepository.findForUser(otherId).firstOrNull()
        logger.info(
            "User {} looked up the address of pen pal {} in connection {}: {}",
            currentUserId, otherId, connectionId, if (address != null) "found" else "none entered",
        )
        return address
    }

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

}
