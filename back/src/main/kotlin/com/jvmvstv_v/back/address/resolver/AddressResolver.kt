package com.jvmvstv_v.back.address.resolver

import com.jvmvstv_v.back.address.model.ConnectionAddressConsent
import com.jvmvstv_v.back.address.model.CreateAddressInput
import com.jvmvstv_v.back.address.model.UpdateAddressInput
import com.jvmvstv_v.back.address.model.UserAddress
import com.jvmvstv_v.back.address.service.AddressService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class AddressResolver(private val addressService: AddressService) {
    @QueryMapping
    fun myAddresses(): List<UserAddress> = addressService.myAddresses()

    @QueryMapping
    fun addressConsentsForConnection(@Argument connectionId: UUID): List<ConnectionAddressConsent> =
        addressService.consentsForConnection(connectionId)

    @MutationMapping
    fun createAddress(@Argument input: CreateAddressInput): UserAddress = addressService.createAddress(input)

    @MutationMapping
    fun updateAddress(@Argument id: UUID, @Argument input: UpdateAddressInput): UserAddress =
        addressService.updateAddress(id, input)

    @MutationMapping
    fun deleteAddress(@Argument id: UUID): Boolean = addressService.deleteAddress(id)

    @MutationMapping
    fun grantAddressConsent(@Argument connectionId: UUID, @Argument addressId: UUID): ConnectionAddressConsent =
        addressService.grantConsent(connectionId, addressId)

    @MutationMapping
    fun revokeAddressConsent(@Argument connectionId: UUID): ConnectionAddressConsent =
        addressService.revokeConsent(connectionId)
}
