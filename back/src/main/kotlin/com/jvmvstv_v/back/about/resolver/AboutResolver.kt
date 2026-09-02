package com.jvmvstv_v.back.about.resolver

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.service.AboutService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.UUID

@Controller
class AboutResolver(private val aboutService: AboutService) {
    @QueryMapping
    fun aboutPage(): AboutPage = aboutService.aboutPage()

    @MutationMapping
    fun updateAboutPageBody(@Argument body: String): AboutPage = aboutService.updateBody(body)

    @MutationMapping
    fun addAboutPagePhoto(
        @Argument mimeType: String,
        @Argument imageBase64: String,
        @Argument caption: String?,
    ): AboutPage = aboutService.addPhoto(mimeType, imageBase64, caption)

    @MutationMapping
    fun removeAboutPagePhoto(@Argument id: UUID): AboutPage = aboutService.removePhoto(id)
}
