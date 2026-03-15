/**
 * 
 */
package com.server.realsync.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/assets/**")
                                .addResourceLocations("classpath:/static/assets/");
                //
                registry.addResourceHandler("/web-assets/**")
                                .addResourceLocations("classpath:/static/web-assets/");
                //
                registry.addResourceHandler("/client-assets/**")
                                .addResourceLocations("classpath:/static/client-assets/");
                //
                registry.addResourceHandler("/finapp-assets/**")
                                .addResourceLocations("classpath:/static/finapp-assets/");
                //
                registry.addResourceHandler("/realsync-assets/**")
                                .addResourceLocations("classpath:/static/realsync-assets/");
                registry.addResourceHandler("/js/**")
                                .addResourceLocations("classpath:/static/js/");
                registry.addResourceHandler("/css/**")
                                .addResourceLocations("classpath:/static/css/");
        }

}
