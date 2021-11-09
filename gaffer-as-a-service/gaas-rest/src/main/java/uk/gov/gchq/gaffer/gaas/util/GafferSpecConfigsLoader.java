/*
 * Copyright 2021 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package uk.gov.gchq.gaffer.gaas.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;
import uk.gov.gchq.gaffer.common.model.v1.GafferSpec;
import uk.gov.gchq.gaffer.gaas.exception.GaaSRestApiException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class GafferSpecConfigsLoader {

    @Autowired
    private ResourceLoader resourceLoader;

    private final Yaml yaml = new Yaml();

    public Map<String, GafferSpec> listConfigSpecs(final String configDirectory) throws GaaSRestApiException {

        try {
            final Resource[] gafferConfigYamlResources = loadResources("classpath*:" + configDirectory + "/*.yaml");
            final Map<String, GafferSpec> configSpecs = new HashMap<>();

            for (final Resource resource : gafferConfigYamlResources) {

                final String configFileName = resource.getFilename().split("\\.", 2)[0];
                GafferSpec gaasGraphConfigYaml = yaml.loadAs(resource.getInputStream(), GafferSpec.class);
                if (gaasGraphConfigYaml == null) {
                    gaasGraphConfigYaml = new GafferSpec();
                }
                configSpecs.put(configFileName, gaasGraphConfigYaml);
            }
            return configSpecs;
        } catch (final IOException e) {
            throw new GaaSRestApiException(e.getMessage(), 500, e);
        }
    }

    public GafferSpec getConfig(final String configDirectory, final String configFileName) throws GaaSRestApiException {

        try {
            final Resource[] resources = loadResources("classpath*:" + configDirectory + "/" + configFileName + ".yaml");

            for (final Resource resource : resources) {
                final GafferSpec gafferSpec = yaml.loadAs(resource.getInputStream(), GafferSpec.class);
                if (gafferSpec == null) {
                    return new GafferSpec();
                }
                return gafferSpec;
            }
            throw new GaaSRestApiException("GaaS Graph Config Not Found", "Available config names are: " + getStoreTypeNames(), 404);

        } catch (final IOException e) {
            throw new GaaSRestApiException(e.getMessage(), 500, e);
        }
    }

    private Resource[] loadResources(final String pattern) throws IOException {
        return ResourcePatternUtils.getResourcePatternResolver(resourceLoader).getResources(pattern);
    }

    public String getStoreTypeNames() throws IOException {
        List<String> storeTypes = new ArrayList<>();
        Resource[] resources = loadResources("classpath*:config/*.yaml");

        for (final Resource resource : resources) {
            String filename = resource.getFilename().split("\\.", 2)[0];
            storeTypes.add(filename);
        }
        String result = storeTypes.toString().replaceAll("\\[|\\]", "");
        return result;
    }
}
