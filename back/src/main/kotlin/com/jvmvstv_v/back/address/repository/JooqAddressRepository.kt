package com.jvmvstv_v.back.address.repository

import com.jvmvstv_v.back.address.model.AddressConsentStatus
import com.jvmvstv_v.back.address.model.ConnectionAddressConsent
import com.jvmvstv_v.back.address.model.CreateAddressInput
import com.jvmvstv_v.back.address.model.UpdateAddressInput
import com.jvmvstv_v.back.address.model.UserAddress
import com.jvmvstv_v.back.matching.repository.MatchingRepository
import com.jvmvstv_v.back.user.repository.UserRepository
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.jooq.impl.SQLDataType
import org.springframework.stereotype.Repository
import java.time.OffsetDateTime
import java.util.UUID

@Repository
class JooqAddressRepository(
    private val dsl: DSLContext,
    private val matchingRepository: MatchingRepository,
    private val userRepository: UserRepository,
) : AddressRepository {
    private val ADDRESSES = DSL.table("user_addresses")
    private val A_ID = DSL.field("id", SQLDataType.UUID)
    private val A_USER_ID = DSL.field("user_id", SQLDataType.UUID)
    private val A_RECIPIENT_NAME = DSL.field("recipient_name", SQLDataType.VARCHAR)
    private val A_STREET_LINE1 = DSL.field("street_line1", SQLDataType.VARCHAR)
    private val A_STREET_LINE2 = DSL.field("street_line2", SQLDataType.VARCHAR)
    private val A_CITY = DSL.field("city", SQLDataType.VARCHAR)
    private val A_REGION = DSL.field("region", SQLDataType.VARCHAR)
    private val A_POSTAL_CODE = DSL.field("postal_code", SQLDataType.VARCHAR)
    private val A_COUNTRY_CODE = DSL.field("country_code", SQLDataType.VARCHAR)
    private val A_IS_PRIMARY = DSL.field("is_primary", SQLDataType.BOOLEAN)
    private val A_VERIFIED_AT = DSL.field("verified_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val A_CREATED_AT = DSL.field("created_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val A_UPDATED_AT = DSL.field("updated_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val A_DELETED_AT = DSL.field("deleted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    private val ADDRESS_COLUMNS = listOf(A_ID, A_RECIPIENT_NAME, A_STREET_LINE1, A_STREET_LINE2, A_CITY, A_REGION,
        A_POSTAL_CODE, A_COUNTRY_CODE, A_IS_PRIMARY, A_VERIFIED_AT, A_CREATED_AT, A_UPDATED_AT)

    private val CONSENTS = DSL.table("connection_address_consents")
    private val CO_ID = DSL.field("id", SQLDataType.UUID)
    private val CO_CONNECTION_ID = DSL.field("connection_id", SQLDataType.UUID)
    private val CO_GRANTOR_ID = DSL.field("grantor_id", SQLDataType.UUID)
    private val CO_ADDRESS_ID = DSL.field("address_id", SQLDataType.UUID)
    private val CO_STATUS = DSL.field("status", SQLDataType.VARCHAR)
    private val CO_GRANTED_AT = DSL.field("granted_at", SQLDataType.TIMESTAMPWITHTIMEZONE)
    private val CO_REVOKED_AT = DSL.field("revoked_at", SQLDataType.TIMESTAMPWITHTIMEZONE)

    override fun findForUser(userId: UUID): List<UserAddress> =
        dsl.select(ADDRESS_COLUMNS).from(ADDRESSES)
            .where(A_USER_ID.eq(userId)).and(A_DELETED_AT.isNull)
            .orderBy(A_IS_PRIMARY.desc(), A_CREATED_AT)
            .fetch { toAddress(it) }

    override fun findConsentsForConnection(connectionId: UUID): List<ConnectionAddressConsent> =
        dsl.select(CO_ID, CO_CONNECTION_ID, CO_GRANTOR_ID, CO_ADDRESS_ID, CO_STATUS, CO_GRANTED_AT, CO_REVOKED_AT)
            .from(CONSENTS)
            .where(CO_CONNECTION_ID.eq(connectionId))
            .fetch { toConsent(it) }

    override fun create(userId: UUID, input: CreateAddressInput): UserAddress {
        val id = UUID.randomUUID()
        val now = OffsetDateTime.now()
        if (input.isPrimary == true) clearPrimary(userId)
        dsl.insertInto(ADDRESSES)
            .columns(A_ID, A_USER_ID, A_RECIPIENT_NAME, A_STREET_LINE1, A_STREET_LINE2, A_CITY, A_REGION,
                A_POSTAL_CODE, A_COUNTRY_CODE, A_IS_PRIMARY, A_CREATED_AT, A_UPDATED_AT)
            .values(id, userId, input.recipientName, input.streetLine1, input.streetLine2, input.city, input.region,
                input.postalCode, input.countryCode, input.isPrimary ?: false, now, now)
            .execute()
        return findById(id) ?: error("Address $id not found")
    }

    override fun update(id: UUID, input: UpdateAddressInput): UserAddress {
        if (input.isPrimary == true) {
            val address = findById(id) ?: error("Address $id not found")
            clearPrimary(userIdOf(address.id))
        }
        val step = dsl.update(ADDRESSES).set(A_UPDATED_AT, OffsetDateTime.now())
        input.recipientName?.let { step.set(A_RECIPIENT_NAME, it) }
        input.streetLine1?.let { step.set(A_STREET_LINE1, it) }
        input.streetLine2?.let { step.set(A_STREET_LINE2, it) }
        input.city?.let { step.set(A_CITY, it) }
        input.region?.let { step.set(A_REGION, it) }
        input.postalCode?.let { step.set(A_POSTAL_CODE, it) }
        input.countryCode?.let { step.set(A_COUNTRY_CODE, it) }
        input.isPrimary?.let { step.set(A_IS_PRIMARY, it) }
        step.where(A_ID.eq(id)).execute()
        return findById(id) ?: error("Address $id not found")
    }

    override fun delete(id: UUID): Boolean =
        dsl.update(ADDRESSES).set(A_DELETED_AT, OffsetDateTime.now()).where(A_ID.eq(id)).execute() > 0

    override fun grantConsent(connectionId: UUID, grantorId: UUID, addressId: UUID): ConnectionAddressConsent {
        val now = OffsetDateTime.now()
        dsl.insertInto(CONSENTS)
            .columns(CO_ID, CO_CONNECTION_ID, CO_GRANTOR_ID, CO_ADDRESS_ID, CO_STATUS, CO_GRANTED_AT)
            .values(UUID.randomUUID(), connectionId, grantorId, addressId, AddressConsentStatus.GRANTED.name, now)
            .onConflict(CO_CONNECTION_ID, CO_GRANTOR_ID)
            .doUpdate()
            .set(CO_ADDRESS_ID, addressId)
            .set(CO_STATUS, AddressConsentStatus.GRANTED.name)
            .set(CO_GRANTED_AT, now)
            .set(CO_REVOKED_AT, null as OffsetDateTime?)
            .execute()
        return findConsent(connectionId, grantorId) ?: error("Consent not found")
    }

    override fun revokeConsent(connectionId: UUID, grantorId: UUID): ConnectionAddressConsent {
        dsl.update(CONSENTS)
            .set(CO_STATUS, AddressConsentStatus.REVOKED.name)
            .set(CO_REVOKED_AT, OffsetDateTime.now())
            .where(CO_CONNECTION_ID.eq(connectionId)).and(CO_GRANTOR_ID.eq(grantorId))
            .execute()
        return findConsent(connectionId, grantorId) ?: error("Consent not found")
    }

    private fun clearPrimary(userId: UUID) {
        dsl.update(ADDRESSES).set(A_IS_PRIMARY, false)
            .where(A_USER_ID.eq(userId)).and(A_IS_PRIMARY.isTrue)
            .execute()
    }

    private fun userIdOf(addressId: UUID): UUID =
        dsl.select(A_USER_ID).from(ADDRESSES).where(A_ID.eq(addressId)).fetchOne(A_USER_ID)
            ?: error("Address $addressId not found")

    private fun findById(id: UUID): UserAddress? =
        dsl.select(ADDRESS_COLUMNS).from(ADDRESSES).where(A_ID.eq(id)).fetchOne { toAddress(it) }

    private fun findConsent(connectionId: UUID, grantorId: UUID): ConnectionAddressConsent? =
        dsl.select(CO_ID, CO_CONNECTION_ID, CO_GRANTOR_ID, CO_ADDRESS_ID, CO_STATUS, CO_GRANTED_AT, CO_REVOKED_AT)
            .from(CONSENTS)
            .where(CO_CONNECTION_ID.eq(connectionId)).and(CO_GRANTOR_ID.eq(grantorId))
            .fetchOne { toConsent(it) }

    private fun toAddress(record: Record): UserAddress = UserAddress(
        id = record[A_ID]!!,
        recipientName = record[A_RECIPIENT_NAME]!!,
        streetLine1 = record[A_STREET_LINE1]!!,
        streetLine2 = record[A_STREET_LINE2],
        city = record[A_CITY]!!,
        region = record[A_REGION],
        postalCode = record[A_POSTAL_CODE],
        countryCode = record[A_COUNTRY_CODE]!!,
        isPrimary = record[A_IS_PRIMARY]!!,
        verifiedAt = record[A_VERIFIED_AT]?.toString(),
        createdAt = record[A_CREATED_AT]!!.toString(),
        updatedAt = record[A_UPDATED_AT]!!.toString(),
    )

    private fun toConsent(record: Record): ConnectionAddressConsent {
        val addressId = record[CO_ADDRESS_ID]
        return ConnectionAddressConsent(
            id = record[CO_ID]!!,
            connection = matchingRepository.findConnectionById(record[CO_CONNECTION_ID]!!)
                ?: error("Connection not found"),
            grantor = userRepository.findById(record[CO_GRANTOR_ID]!!) ?: error("User not found"),
            address = addressId?.let { findById(it) },
            status = AddressConsentStatus.valueOf(record[CO_STATUS]!!),
            grantedAt = record[CO_GRANTED_AT]!!.toString(),
            revokedAt = record[CO_REVOKED_AT]?.toString(),
        )
    }
}
