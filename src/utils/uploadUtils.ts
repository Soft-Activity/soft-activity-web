import { uploadFile, uploadImage } from '@/api/servers/api/commonController'

/**
 * 文件上传工具类
 */
export class UploadUtils {
  // 默认允许的文件类型
  private static readonly DEFAULT_ALLOWED_TYPES = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.txt',
    '.zip',
    '.rar'
  ]

  // 默认文件大小限制（单位：MB）
  private static readonly DEFAULT_MAX_SIZE = {
    IMAGE: 5, // 图片最大 5MB
    FILE: 10 // 文件最大 10MB
  }

  /**
   * 上传图片
   * @param file 图片文件
   * @param onProgress 上传进度回调
   * @returns Promise<string> 返回图片URL
   */
  static async uploadImage(file: File, onProgress?: (percent: number) => void): Promise<string> {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('请上传图片文件')
    }

    // 验证文件大小
    if (file.size > this.DEFAULT_MAX_SIZE.IMAGE * 1024 * 1024) {
      throw new Error(`图片大小不能超过${this.DEFAULT_MAX_SIZE.IMAGE}MB`)
    }

    try {
      const response = await uploadImage({}, file, {
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total > 0) {
            const percent = (progressEvent.loaded * 100) / progressEvent.total
            onProgress(Math.round(percent))
          }
        }
      })

      return response.data
    } catch (error) {
      console.error('图片上传失败:', error)
      throw new Error('图片上传失败')
    }
  }

  /**
   * 上传文件
   * @param file 文件对象
   * @param onProgress 上传进度回调
   * @returns Promise<string> 返回文件URL
   */
  static async uploadFile(file: File, onProgress?: (percent: number) => void): Promise<string> {
    // 验证文件类型

    // 验证文件大小
    if (file.size > this.DEFAULT_MAX_SIZE.FILE * 1024 * 1024) {
      throw new Error(`文件大小不能超过${this.DEFAULT_MAX_SIZE.FILE}MB`)
    }
    try {
      const response = await uploadFile({}, file, {
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total > 0) {
            const percent = (progressEvent.loaded * 100) / progressEvent.total
            onProgress(Math.round(percent))
          }
        }
      })

      return response.data
    } catch (error) {
      console.error('文件上传失败:', error)
      throw new Error('文件上传失败')
    }
  }
}
