package com.jvmvstv_v.back.language.service

import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.language.model.Language
import com.jvmvstv_v.back.language.model.LanguageProficiency
import com.jvmvstv_v.back.language.model.LanguagePurpose
import com.jvmvstv_v.back.language.model.UserLanguage
import com.jvmvstv_v.back.language.repository.LanguageRepository
import org.springframework.stereotype.Service

@Service
class LanguageServiceImpl(private val languageRepository: LanguageRepository) : LanguageService {
    override fun languages(activeOnly: Boolean?): List<Language> = languageRepository.findAll(activeOnly)

    override fun myLanguages(): List<UserLanguage> = languageRepository.findForUser(CurrentUser.id)

    override fun setUserLanguage(
        languageCode: String,
        purpose: LanguagePurpose,
        proficiency: LanguageProficiency?,
    ): UserLanguage = languageRepository.setUserLanguage(CurrentUser.id, languageCode, purpose, proficiency)

    override fun removeUserLanguage(languageCode: String, purpose: LanguagePurpose): Boolean =
        languageRepository.removeUserLanguage(CurrentUser.id, languageCode, purpose)
}
