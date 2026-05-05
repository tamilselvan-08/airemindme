/**
 * 
 */
package com.server.realsync.services;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
/**
 * 
 */
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;

import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {

	@Value("${storage.local.directory}")
	private String localDirectory;

	@Value("${spaces.bucket-name}")
	private String bucketName;

	@Value("${storage.use-cloud}")
	private boolean useCloud;
	
	@Value("${spaces.secret-access-key}")
	private String secretAccessKey;
	
	@Value("${spaces.access-key-id}")
	private String accessKeyId;
	
	@Value("${spaces.endpoint}")
	private String endpoint;

	private AmazonS3 amazonS3;
	
	@PostConstruct
    public void init() {
        if (useCloud) {
            BasicAWSCredentials awsCreds = new BasicAWSCredentials(accessKeyId, secretAccessKey);
        	//BasicAWSCredentials awsCreds = new BasicAWSCredentials("LREDHOT6P2CEFVO3TBUZ", "zfXjBO4DSJXCeftFjRJ8PKFpgzjQBnFcuQdsUbZe");
            /*amazonS3 = AmazonS3ClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpoint, "blr1")) // Adjust region accordingly
                    .withCredentials(new AWSStaticCredentialsProvider(awsCreds))
                    .build();*/
            amazonS3 = AmazonS3ClientBuilder.standard()
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endpoint, "" )) // Adjust region accordingly
                    .withCredentials(new AWSStaticCredentialsProvider(awsCreds))
                    .build();
            //1 MB upload - response time - ? (100-200ms)
            //1 MB download - response time - ? (100-200ms)
            // Per object (meta data) - 0.0000088  
            // GB Store - 0.004, Read - 0.007
        }
    }

	public void uploadFile(String path, MultipartFile file, String fileName) throws IOException {
		InputStream inputStream = file.getInputStream();
		System.out.println("🔥 BUCKET NAME USED: " + bucketName);
		if (useCloud) {
			//ObjectMetadata metadata = new ObjectMetadata();
			//metadata.setCacheControl("31536000");
			String cleanedPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
			ObjectMetadata metadata = new ObjectMetadata();
			metadata.setContentLength(file.getSize()); // Set content length
			amazonS3.putObject(new PutObjectRequest(bucketName, cleanedPath + "/" + fileName, inputStream, metadata)
					.withCannedAcl(CannedAccessControlList.PublicRead));
		} else {
			File localFile = new File(localDirectory + "/" + path + "/" + fileName);
			localFile.getParentFile().mkdirs();
			try (FileOutputStream fos = new FileOutputStream(localFile)) {
				fos.write(inputStream.readAllBytes());
			}
		}
	}
	
	public boolean exists(String path, String fileName) {
	    String cleanedPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;

	    if (useCloud) {
	        return amazonS3.doesObjectExist(bucketName, cleanedPath + "/" + fileName);
	    } else {
	        File localFile = new File(localDirectory + "/" + path + "/" + fileName);
	        return localFile.exists();
	    }
	}

	public Resource loadFileAsResource(String path, String fileName) throws IOException {
	    String cleanedPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;

	    if (useCloud) {
	        // Load from S3
	        try {
	            S3Object s3Object = amazonS3.getObject(bucketName, cleanedPath + "/" + fileName);
	            S3ObjectInputStream s3is = s3Object.getObjectContent();
	            // Wrap the InputStream into a Spring Resource
	            return new InputStreamResource(s3is);
	        } catch (Exception e) {
	            throw new FileNotFoundException("File not found in S3: " + fileName);
	        }
	    } else {
	        // Load from local storage
	        File localFile = new File(localDirectory + "/" + path + "/" + fileName);
	        if (!localFile.exists()) {
	            throw new FileNotFoundException("File not found locally: " + localFile.getAbsolutePath());
	        }
	        return new FileSystemResource(localFile);
	    }
	}
	public void uploadFile(String path, InputStream inputStream, String fileName) throws IOException {
	    String cleanedPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;

	    if (useCloud) {
	        ObjectMetadata metadata = new ObjectMetadata();
	        metadata.setContentLength(inputStream.available());
	        amazonS3.putObject(new PutObjectRequest(bucketName, cleanedPath + "/" + fileName, inputStream, metadata)
	                .withCannedAcl(CannedAccessControlList.PublicRead));
	    } else {
	        File localFile = new File(localDirectory + "/" + path + "/" + fileName);
	        localFile.getParentFile().mkdirs();
	        try (FileOutputStream fos = new FileOutputStream(localFile)) {
	            fos.write(inputStream.readAllBytes());
	        }
	    }
	}

	public void deleteFile(String path, String fileName) throws IOException {
	    if (useCloud) {
	        // --- Delete from AWS S3 ---
	        String cleanedPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
	        String key = cleanedPath + "/" + fileName;
	        amazonS3.deleteObject(bucketName, key);
	    } else {
	        // --- Delete from Local Storage ---
	        File localFile = new File(localDirectory + "/" + path + "/" + fileName);
	        if (localFile.exists()) {
	            if (!localFile.delete()) {
	                throw new IOException("Failed to delete file: " + localFile.getAbsolutePath());
	            }
	        }
	    }
	}
	
	@Async
	public void uploadFile(String path, InputStream inputStream, String filename, MultipartFile file) throws IOException {
		if (useCloud) {
			//ObjectMetadata metadata = new ObjectMetadata();
			//metadata.setCacheControl("31536000");
			String cleanedPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
			ObjectMetadata metadata = new ObjectMetadata();
			//metadata.setContentLength(file.getSize()); // Set content length
			amazonS3.putObject(new PutObjectRequest(bucketName, cleanedPath + "/" + filename, inputStream, metadata)
					.withCannedAcl(CannedAccessControlList.PublicRead));
		} else {
			File localFile = new File(localDirectory + "/" + path + "/" + filename);
			localFile.getParentFile().mkdirs();
			try (FileOutputStream fos = new FileOutputStream(localFile)) {
				fos.write(inputStream.readAllBytes());
			}
		}
	}

	public InputStream downloadFile(String path, String filename) throws IOException {
		if (useCloud) {
			String cleanedPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;
			S3Object s3Object = amazonS3.getObject(bucketName, cleanedPath + "/" + filename);
			return s3Object.getObjectContent();
		} else {
			File file = new File(localDirectory + "/" + path + "/" + filename);
			if (file.exists()) {
				return new FileInputStream(file);
			} else {
				throw new FileNotFoundException("File not found.");
			}
		}
	}
	

	public AmazonS3 getAmazonS3() {
		return amazonS3;
	}

	public void setAmazonS3(AmazonS3 amazonS3) {
		this.amazonS3 = amazonS3;
	}

	public String getBucketName() {
		return bucketName;
	}

	public void setBucketName(String bucketName) {
		this.bucketName = bucketName;
	}
}
