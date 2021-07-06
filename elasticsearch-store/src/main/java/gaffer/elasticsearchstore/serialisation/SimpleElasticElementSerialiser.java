/*
 * Copyright 2016 Crown Copyright
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

package gaffer.elasticsearchstore.serialisation;

import gaffer.data.element.Element;
import gaffer.exception.SerialisationException;
import gaffer.jsonserialisation.JSONSerialiser;
import gaffer.serialisation.Serialisation;

public class SimpleElasticElementSerialiser implements Serialisation {
    private static final long serialVersionUID = -3541521304943242654L;
    private static final JSONSerialiser JSON_SERIALISER = new JSONSerialiser();

    @Override
    public boolean canHandle(final Class clazz) {
        return Element.class.equals(clazz);
    }

    @Override
    public byte[] serialise(final Object object) throws SerialisationException {
        Element element = (Element) object;
        return JSON_SERIALISER.serialise(element);
    }

    @Override
    public Object deserialise(final byte[] bytes) throws SerialisationException {
        return null;
    }
}
