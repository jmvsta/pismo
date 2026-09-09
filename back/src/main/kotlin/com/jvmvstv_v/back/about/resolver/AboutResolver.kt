package com.jvmvstv_v.back.about.resolver

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.model.AboutPageBlockAlign
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
    fun addAboutPageTextBlock(
        @Argument text: String,
        @Argument x: Double,
        @Argument y: Double,
        @Argument width: Double,
        @Argument height: Double,
    ): AboutPage = aboutService.addTextBlock(text, x, y, width, height)

    @MutationMapping
    fun addAboutPagePhotoBlock(
        @Argument mimeType: String,
        @Argument imageBase64: String,
        @Argument x: Double,
        @Argument y: Double,
        @Argument width: Double,
        @Argument height: Double,
    ): AboutPage = aboutService.addPhotoBlock(mimeType, imageBase64, x, y, width, height)

    @MutationMapping
    fun updateAboutPageBlockLayout(
        @Argument id: UUID,
        @Argument x: Double,
        @Argument y: Double,
        @Argument width: Double,
        @Argument height: Double,
    ): AboutPage = aboutService.updateBlockLayout(id, x, y, width, height)

    @MutationMapping
    fun updateAboutPageBlockAlign(@Argument id: UUID, @Argument align: AboutPageBlockAlign): AboutPage =
        aboutService.updateBlockAlign(id, align)

    @MutationMapping
    fun updateAboutPageBlockText(@Argument id: UUID, @Argument text: String): AboutPage =
        aboutService.updateBlockText(id, text)

    @MutationMapping
    fun removeAboutPageBlock(@Argument id: UUID): AboutPage = aboutService.removeBlock(id)
}
