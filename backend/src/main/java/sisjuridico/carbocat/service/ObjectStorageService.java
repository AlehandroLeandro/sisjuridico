package sisjuridico.carbocat.service;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sisjuridico.carbocat.exception.StorageException;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ObjectStorageService {
    private final MinioClient minioClient;

    @Value("${app.storage.bucket}")
    private String bucket;

    public void upload(String objectKey, MultipartFile file, String contentType) {
        try (InputStream input = file.getInputStream()) {
            ensureBucket();
            minioClient.putObject(PutObjectArgs.builder().bucket(bucket).object(objectKey)
                    .stream(input, file.getSize(), -1).contentType(contentType).build());
        } catch (Exception exception) {
            throw new StorageException("Não foi possível armazenar o documento.", exception);
        }
    }

    public String downloadUrl(String objectKey) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder().bucket(bucket).object(objectKey)
                    .method(Method.GET).expiry(5, TimeUnit.MINUTES).build());
        } catch (Exception exception) {
            throw new StorageException("Não foi possível gerar o link de download.", exception);
        }
    }

    public void delete(String objectKey) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(objectKey).build());
        } catch (Exception exception) {
            throw new StorageException("Não foi possível remover o documento armazenado.", exception);
        }
    }

    private void ensureBucket() throws Exception {
        if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
    }
}
