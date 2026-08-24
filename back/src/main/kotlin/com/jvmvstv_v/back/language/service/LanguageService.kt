package com.jvmvstv_v.back.language.service

import com.jvmvstv_v.back.language.model.Language
import com.jvmvstv_v.back.language.model.LanguageProficiency
import com.jvmvstv_v.back.language.model.LanguagePurpose
import com.jvmvstv_v.back.language.model.UserLanguage

interface LanguageService {
    fun languages(activeOnly: Boolean?): List<Language>
    fun myLanguages(): List<UserLanguage>
    fun setUserLanguage(languageCode: String, purpose: LanguagePurpose, proficiency: LanguageProficiency?): UserLanguage
    fun removeUserLanguage(languageCode: String, purpose: LanguagePurpose): Boolean
}
