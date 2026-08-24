package com.jvmvstv_v.back.language.resolver

import com.jvmvstv_v.back.language.model.Language
import com.jvmvstv_v.back.language.model.LanguageProficiency
import com.jvmvstv_v.back.language.model.LanguagePurpose
import com.jvmvstv_v.back.language.model.UserLanguage
import com.jvmvstv_v.back.language.service.LanguageService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

@Controller
class LanguageResolver(private val languageService: LanguageService) {
    @QueryMapping
    fun languages(@Argument activeOnly: Boolean?): List<Language> = languageService.languages(activeOnly)

    @QueryMapping
    fun myLanguages(): List<UserLanguage> = languageService.myLanguages()

    @MutationMapping
    fun setUserLanguage(
        @Argument languageCode: String,
        @Argument purpose: LanguagePurpose,
        @Argument proficiency: LanguageProficiency?,
    ): UserLanguage = languageService.setUserLanguage(languageCode, purpose, proficiency)

    @MutationMapping
    fun removeUserLanguage(@Argument languageCode: String, @Argument purpose: LanguagePurpose): Boolean =
        languageService.removeUserLanguage(languageCode, purpose)
}
