package com.jvmvstv_v.back.about.service

import com.jvmvstv_v.back.about.model.AboutPage
import com.jvmvstv_v.back.about.repository.AboutRepository
import com.jvmvstv_v.back.common.CurrentUser
import com.jvmvstv_v.back.image.model.ImageOwnerType
import com.jvmvstv_v.back.image.service.ImageService
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AboutServiceImpl(
    private val aboutRepository: AboutRepository,
    private val imageService: ImageService,
) : AboutService {
    override fun aboutPage(): AboutPage = aboutRepository.find()

    override fun updateBody(body: String): AboutPage {
        CurrentUser.requireAdmin()
        return aboutRepository.updateBody(body, CurrentUser.id)
    }

    override fun addPhoto(mimeType: String, imageBase64: String, caption: String?): AboutPage {
        CurrentUser.requireAdmin()
        val photoId = UUID.randomUUID()
        val image = imageService.store(ImageOwnerType.ABOUT_PAGE_PHOTO, photoId, mimeType, imageBase64)
        return aboutRepository.addPhoto(photoId, image.id, caption)
    }

    override fun removePhoto(id: UUID): AboutPage {
        CurrentUser.requireAdmin()
        aboutRepository.removePhoto(id)?.let { imageService.delete(it) }
        return aboutRepository.find()
    }
}
