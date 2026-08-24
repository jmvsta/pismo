package com.jvmvstv_v.back.language.repository

import com.jvmvstv_v.back.language.model.Language
import com.jvmvstv_v.back.language.model.LanguageProficiency
import com.jvmvstv_v.back.language.model.LanguagePurpose
import com.jvmvstv_v.back.language.model.UserLanguage
import java.util.UUID

interface LanguageRepository {
    fun findAll(activeOnly: Boolean?): List<Language>
    fun findByCode(code: String): Language?
    fun findForUser(userId: UUID): List<UserLanguage>
    fun setUserLanguage(
        userId: UUID,
        languageCode: String,
        purpose: LanguagePurpose,
        proficiency: LanguageProficiency?,
    ): UserLanguage
    fun removeUserLanguage(userId: UUID, languageCode: String, purpose: LanguagePurpose): Boolean
}
