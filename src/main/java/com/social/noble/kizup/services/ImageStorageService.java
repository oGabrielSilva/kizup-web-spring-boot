package com.social.noble.kizup.services;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.Identity;
import com.google.cloud.Policy;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.storage.StorageRoles;

@Service
public class ImageStorageService {
    private String projectId;
    private String defaultBucketName;

    public ImageStorageService(@Value("${cloud.project.id}") String projectId,
            @Value("${cloud.project.bucket.name}") String defaultBucketName) {
        this.projectId = projectId;
        this.defaultBucketName = defaultBucketName;
    }

    public synchronized Bucket getBucket() {
        if (storage == null) {
            storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
            Policy originalPolicy = storage.getIamPolicy(defaultBucketName);
            storage.setIamPolicy(
                    defaultBucketName,
                    originalPolicy
                            .toBuilder()
                            .addIdentity(StorageRoles.objectViewer(), Identity.allUsers()) // All users can view
                            .build());
        }
        if (bucket == null || !bucket.getName().equals(defaultBucketName)) {
            bucket = storage.get(defaultBucketName);
        }
        return bucket;
    }

    public synchronized Bucket getBucket(String bucketName) {
        if (storage == null) {
            storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();
            Policy originalPolicy = storage.getIamPolicy(defaultBucketName);
            storage.setIamPolicy(
                    defaultBucketName,
                    originalPolicy
                            .toBuilder()
                            .addIdentity(StorageRoles.objectViewer(), Identity.allUsers()) // All users can view
                            .build());
        }
        if (bucketName == null) {
            bucketName = defaultBucketName;
        }
        if (bucket == null || !bucket.getName().equals(bucketName)) {
            bucket = storage.get(bucketName);
        }
        return bucket;
    }

    public synchronized String upload(MultipartFile file, UUID userUID) {
        try {
            if (bucket == null || storage == null) {
                getBucket();
            }
            String bucketName = bucket.getName();
            String fileName = "avatar/" + userUID.toString().concat(".jpeg");
            BlobId blobId = BlobId.of(bucketName, fileName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId).build();

            Storage.BlobWriteOption precondition = storage.get(bucketName, fileName) == null
                    ? Storage.BlobWriteOption.doesNotExist()
                    : Storage.BlobWriteOption.generationMatch(
                            storage.get(bucketName, fileName).getGeneration());

            storage.createFrom(blobInfo, file.getInputStream(), precondition);
            String url = new String("https://[bucket].storage.googleapis.com/[file]")
                    .replace("[bucket]", bucketName)
                    .replace("[file]", fileName);
            return url;
        } catch (Exception e) {
            System.err.println("\n\nImageStorageService ERR: " + e.getMessage());
            e.printStackTrace();
            System.out.println("\n" + userUID);
            System.out.println(Instant.now().toString() + "\n\n");
            return null;
        }
    }

    private static Storage storage = null;
    private static Bucket bucket = null;
}
