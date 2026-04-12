<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import LineNumberedTextarea from "../components/LineNumberedTextarea.vue";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";
import Ajv04 from "ajv-draft-04";
import {
  ShieldCheck,
  CheckCircle,
  Trash2,
  Search,
  PartyPopper,
  XCircle,
} from "lucide-vue-next";
import { useSeoMeta } from "@/composables/useSeoMeta";

const { t } = useI18n();
useSeoMeta({
  titleKey: "tools.schemaValidator.title",
  descriptionKey: "tools.schemaValidator.description",
});

// Estado
const schema = ref("");
const jsonData = ref("");
const selectedExample = ref("");
const validationResult = ref(null);
const schemaInfo = ref(null);
const ajvOptions = ref({
  strict: false,
  allErrors: true,
  verbose: true,
});
const schemaDraft = ref("auto");

const ajvInstance = computed(() => {
  // Crear una instancia nueva cada vez que cambien opciones o draft
  let ajv;

  if (schemaDraft.value === "04") {
    // Para Draft-04, usar la librería específica
    ajv = new Ajv04({
      ...ajvOptions.value,
      loadSchema: false,
      // Configuración para CSP compatibility
      strict: false,
      validateFormats: false,
    });
  } else {
    // Para otros drafts, usar AJV estándar
    ajv = new Ajv({
      ...ajvOptions.value,
      validateFormats: true,
      // Permitir esquemas sin $schema o con referencias remotas
      schemaId: "auto",
      addUsedSchema: false,
      // Meta esquemas incluidos automáticamente
      meta: true,
      // Permitir referencias
      loadSchema: false,
      // Configuración para CSP compatibility
      strict: false,
    });
  }

  addFormats(ajv);
  ajvErrors(ajv);

  return ajv;
});

const examples = {
  person: {
    schema: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "title": "Persona",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "address": {
      "type": "object",
      "properties": {
        "street": {
          "type": "string",
          "minLength": 1
        },
        "city": {
          "type": "string",
          "minLength": 1
        },
        "zipCode": {
          "type": "string",
          "pattern": "^[0-9]{5}(-[0-9]{4})?$"
        }
      },
      "required": ["street", "city"],
      "additionalProperties": false
    }
  },
  "required": ["name", "age", "email"],
  "additionalProperties": false
}`,
    data: `{
  "name": "Juan Pérez",
  "age": 30,
  "email": "juan@example.com",
  "address": {
    "street": "Calle Mayor 123",
    "city": "Madrid",
    "zipCode": "28001"
  }
}`,
  },
  product: {
    schema: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "title": "Producto",
  "properties": {
    "id": {
      "type": "integer",
      "minimum": 1
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "price": {
      "type": "number",
      "minimum": 0
    },
    "category": {
      "type": "string",
      "enum": ["electronics", "clothing", "books", "home", "sports"]
    },
    "inStock": {
      "type": "boolean"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1
      },
      "uniqueItems": true
    },
    "description": {
      "type": "string",
      "maxLength": 1000
    }
  },
  "required": ["id", "name", "price", "category", "inStock"],
  "additionalProperties": false
}`,
    data: `{
  "id": 1,
  "name": "Smartphone Samsung Galaxy",
  "price": 599.99,
  "category": "electronics",
  "inStock": true,
  "tags": ["mobile", "android", "5g", "samsung"],
  "description": "Smartphone de última generación con tecnología 5G"
}`,
  },
  contact: {
    schema: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "title": "Contacto",
  "properties": {
    "firstName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "lastName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 50
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "phones": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": ["home", "work", "mobile", "fax"]
          },
          "number": {
            "type": "string",
            "pattern": "^[+0-9 ()-]+$"
          }
        },
        "required": ["type", "number"],
        "additionalProperties": false
      },
      "minItems": 1,
      "maxItems": 5
    }
  },
  "required": ["firstName", "lastName", "phones"],
  "additionalProperties": false
}`,
    data: `{
  "firstName": "María",
  "lastName": "García",
  "email": "maria.garcia@example.com",
  "phones": [
    {
      "type": "mobile",
      "number": "+34 123 456 789"
    },
    {
      "type": "work",
      "number": "+34 987 654 321"
    }
  ]
}`,
  },
  movie: {
    schema: `{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Película",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "year": {
      "type": "integer",
      "minimum": 1888,
      "maximum": 2030
    },
    "director": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "genre": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["Drama", "Comedia", "Acción", "Terror", "Ciencia Ficción", "Romance", "Thriller", "Documental", "Animación", "Crimen"]
      },
      "minItems": 1,
      "maxItems": 3,
      "uniqueItems": true
    },
    "rating": {
      "type": "number",
      "minimum": 0,
      "maximum": 10
    },
    "duration": {
      "type": "integer",
      "minimum": 1,
      "maximum": 500
    },
    "synopsis": {
      "type": "string",
      "maxLength": 1000
    }
  },
  "required": ["title", "year", "director", "genre"],
  "additionalProperties": false
}`,
    data: `{
  "title": "El Padrino",
  "year": 1972,
  "director": "Francis Ford Coppola",
  "genre": ["Drama", "Crimen"],
  "rating": 9.0,
  "duration": 175,
  "synopsis": "La historia de la familia Corleone bajo el patriarca Vito Corleone, centrándose en la transformación de su hijo menor, Michael, de reluctante forastero familiar a despiadado jefe de la mafia."
}`,
  },
  integer_test: {
    schema: `{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "title": "Test de Tipos Numéricos",
  "properties": {
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },
    "price": {
      "type": "number",
      "minimum": 0
    },
    "percentage": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "count": {
      "type": "integer",
      "minimum": 0
    }
  },
  "required": ["age", "score"],
  "additionalProperties": false
}`,
    data: `{
  "age": 25,
  "score": 85,
  "price": 19.99,
  "percentage": 87.5,
  "count": 42
}`,
  },
  api_response: {
    schema: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "title": "API Response",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["success", "error", "warning"]
    },
    "code": {
      "type": "integer",
      "minimum": 100,
      "maximum": 599
    },
    "message": {
      "type": "string",
      "minLength": 1
    },
    "data": {
      "oneOf": [
        {"type": "object"},
        {"type": "array"},
        {"type": "null"}
      ]
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "field": {
            "type": "string"
          },
          "message": {
            "type": "string"
          }
        },
        "required": ["field", "message"]
      }
    }
  },
  "required": ["status", "code", "message", "timestamp"],
  "additionalProperties": false
}`,
    data: `{
  "status": "success",
  "code": 200,
  "message": "Datos recuperados correctamente",
  "data": {
    "users": [
      {"id": 1, "name": "Juan"},
      {"id": 2, "name": "María"}
    ]
  },
  "timestamp": "2025-08-11T10:30:00Z"
}`,
  },
}; // Validación con Ajv (soporta drafts, formatos, allErrors y mensajes detallados)
const detectDraftFromSchema = (schemaObj) => {
  const s = schemaObj.$schema || "";
  if (s.includes("2020-12")) return "2020-12";
  if (s.includes("2019-09")) return "2019-09";
  if (s.includes("draft-07")) return "07";
  if (s.includes("draft-06")) return "06";
  if (s.includes("draft-04")) return "04";
  return schemaDraft.value;
};

const loadRemoteRef = async (ajv, rootSchema) => {
  // Carga muy básica de $ref remotos http(s)
  const refs = new Set();
  const visit = (obj) => {
    if (obj && typeof obj === "object") {
      if (
        obj.$ref &&
        typeof obj.$ref === "string" &&
        /^https?:\/\//.test(obj.$ref)
      ) {
        refs.add(obj.$ref);
      }
      for (const v of Object.values(obj)) visit(v);
    }
  };
  visit(rootSchema);
  for (const url of refs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const s = await res.json();
        ajv.addSchema(s, url);
      }
    } catch {}
  }
};

const validateSchema = async () => {
  if (!schema.value.trim() || !jsonData.value.trim()) {
    validationResult.value = {
      isValid: false,
      errors: [{ message: t("tools.schemaValidator.schemaAndDataRequired") }],
    };
    return;
  }

  try {
    const parsedSchema = JSON.parse(schema.value);
    const parsedData = JSON.parse(jsonData.value);

    // Detectar draft si auto
    const effectiveDraft =
      schemaDraft.value === "auto"
        ? detectDraftFromSchema(parsedSchema)
        : schemaDraft.value;
    if (effectiveDraft !== schemaDraft.value) {
      schemaDraft.value = effectiveDraft;
    }

    // Crear una copia del esquema sin $schema para evitar problemas de referencia remota
    const schemaForValidation = { ...parsedSchema };
    delete schemaForValidation.$schema;

    // Nueva instancia con el draft/flags actuales
    const ajv = ajvInstance.value;

    // Compilar
    let validate;
    try {
      validate = ajv.compile(schemaForValidation);
    } catch (e) {
      validationResult.value = {
        isValid: false,
        errors: [
          {
            message: t("tools.schemaValidator.invalidSchema", {
              message: e.message,
            }),
          },
        ],
      };
      return;
    }

    const valid = validate(parsedData);
    if (valid) {
      validationResult.value = { isValid: true, errors: [] };
    } else {
      const mapped = (validate.errors || []).map((err) => ({
        instancePath: err.instancePath || "",
        keyword: err.keyword,
        message: err.message,
        params: err.params,
        schemaPath: err.schemaPath,
      }));
      validationResult.value = { isValid: false, errors: mapped };
    }
    calculateSchemaInfo(parsedSchema);
  } catch (error) {
    validationResult.value = {
      isValid: false,
      errors: [
        {
          message: t("tools.schemaValidator.syntaxError", {
            message: error.message,
          }),
        },
      ],
    };
  }
}; // Eliminamos la validación manual anterior y delegamos en Ajv

const calculateSchemaInfo = (schema) => {
  let properties = 0;
  let required = 0;
  let types = new Set();

  const traverse = (obj) => {
    if (obj.type) {
      types.add(obj.type);
    }
    if (obj.properties) {
      properties += Object.keys(obj.properties).length;
      Object.values(obj.properties).forEach(traverse);
    }
    if (obj.required) {
      required += obj.required.length;
    }
    if (obj.items) {
      traverse(obj.items);
    }
  };

  traverse(schema);

  schemaInfo.value = {
    properties,
    required,
    types: types.size,
  };
};

const loadExample = () => {
  if (selectedExample.value && examples[selectedExample.value]) {
    const example = examples[selectedExample.value];
    schema.value = example.schema;
    jsonData.value = example.data;
    validationResult.value = null;
    schemaInfo.value = null;
  }
};

const clearAll = () => {
  schema.value = "";
  jsonData.value = "";
  selectedExample.value = "";
  validationResult.value = null;
  schemaInfo.value = null;
};
</script>

<template>
  <div class="py-8">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          <ShieldCheck class="inline-block w-6 h-6 mr-2 align-text-bottom" />
          {{ t("tools.schemaValidator.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          {{ t("tools.schemaValidator.subtitle") }}
        </p>
      </div>

      <!-- Controls -->
      <div class="p-6 mb-6 card">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-3">
            <button @click="validateSchema" class="btn-primary">
              <CheckCircle
                class="inline-block w-4 h-4 mr-1 align-text-bottom"
              />
              {{ t("tools.schemaValidator.validateSchema") }}
            </button>
            <button @click="clearAll" class="btn-secondary">
              <Trash2 class="inline-block w-4 h-4 mr-1 align-text-bottom" />
              {{ t("tools.schemaValidator.clearAll") }}
            </button>
          </div>
          <div class="flex items-center space-x-4">
            <select v-model="schemaDraft" class="text-sm input-field w-44">
              <option value="auto">Draft: Auto</option>
              <option value="2020-12">Draft 2020-12</option>
              <option value="2019-09">Draft 2019-09</option>
              <option value="07">Draft-07</option>
              <option value="06">Draft-06</option>
              <option value="04">Draft-04</option>
            </select>
            <label
              class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <input type="checkbox" v-model="ajvOptions.allErrors" />
              allErrors
            </label>
            <label
              class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <input type="checkbox" v-model="ajvOptions.strict" />
              strict
            </label>
            <select
              v-model="selectedExample"
              @change="loadExample"
              class="text-sm input-field"
            >
              <option value="">{{ t("common.loadExample") }}</option>
              <option value="person">
                {{ t("tools.schemaValidator.person") }}
              </option>
              <option value="product">
                {{ t("tools.schemaValidator.product") }}
              </option>
              <option value="contact">
                {{ t("tools.schemaValidator.contact") }}
              </option>
              <option value="movie">
                {{ t("tools.schemaValidator.movie") }}
              </option>
              <option value="integer_test">
                {{ t("tools.schemaValidator.numberTest") }}
              </option>
              <option value="api_response">
                {{ t("tools.schemaValidator.apiResponse") }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Schema and Data Editors -->
      <div class="grid gap-6 mb-6 lg:grid-cols-2">
        <!-- JSON Schema -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t("tools.schemaValidator.jsonSchema") }}
            </h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ schema.length }} {{ t("common.characters") }}
            </span>
          </div>
          <LineNumberedTextarea
            v-model="schema"
            class="textarea-field"
            :minHeight="'20rem'"
            :placeholder="t('tools.schemaValidator.schemaPlaceholder')"
            :spellcheck="false"
          />
        </div>

        <!-- JSON Data -->
        <div class="p-6 card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ t("tools.schemaValidator.jsonData") }}
            </h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ jsonData.length }} {{ t("common.characters") }}
            </span>
          </div>
          <LineNumberedTextarea
            v-model="jsonData"
            class="textarea-field"
            :minHeight="'20rem'"
            :placeholder="t('tools.schemaValidator.dataPlaceholder')"
            :spellcheck="false"
          />
        </div>
      </div>

      <!-- Validation Results -->
      <div class="p-6 card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            {{ t("tools.schemaValidator.validationResult") }}
          </h3>
          <div v-if="validationResult" class="flex items-center space-x-2">
            <span
              v-if="validationResult.isValid"
              class="inline-flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200"
            >
              <CheckCircle class="inline-block w-4 h-4 mr-1" />
              {{ t("common.valid") }}
            </span>
            <span
              v-else
              class="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-200"
            >
              <XCircle class="inline-block w-4 h-4 mr-1" />
              {{
                t("tools.schemaValidator.errorCount", {
                  count: validationResult.errors?.length || 0,
                })
              }}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400"
              >Draft: {{ schemaDraft }}</span
            >
          </div>
        </div>

        <!-- No validation yet -->
        <div
          v-if="!validationResult"
          class="py-12 text-center text-gray-500 dark:text-gray-400"
        >
          <Search class="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p>{{ t("tools.schemaValidator.clickToValidate") }}</p>
        </div>

        <!-- Success Result -->
        <div v-else-if="validationResult.isValid" class="py-12 text-center">
          <PartyPopper class="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h4
            class="mb-2 text-lg font-semibold text-green-600 dark:text-green-400"
          >
            {{ t("tools.schemaValidator.validationSuccess") }}
          </h4>
          <p class="text-gray-600 dark:text-gray-300">
            {{ t("tools.schemaValidator.dataComplies") }}
          </p>
        </div>

        <!-- Error Results -->
        <div v-else class="space-y-4">
          <div
            class="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800"
          >
            <h4
              class="mb-3 text-base font-semibold text-red-800 dark:text-red-200"
            >
              {{
                t("tools.schemaValidator.errorsFound", {
                  count: validationResult.errors.length,
                })
              }}
            </h4>

            <div class="space-y-3">
              <div
                v-for="(error, index) in validationResult.errors"
                :key="index"
                class="p-4 bg-white border border-red-300 rounded-lg dark:bg-night-card-inner dark:border-red-700"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <span
                      class="inline-flex items-center justify-center w-6 h-6 text-sm font-medium text-red-600 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-400"
                    >
                      {{ index + 1 }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center mb-2 space-x-2">
                      <span
                        class="text-sm font-medium text-red-800 dark:text-red-200"
                      >
                        {{ t("tools.schemaValidator.path") }}:
                        {{ error.instancePath || "/" }}
                      </span>
                      <span
                        class="px-2 py-1 text-xs text-red-800 bg-red-200 rounded dark:bg-red-800 dark:text-red-200"
                      >
                        {{ error.keyword }}
                      </span>
                      <span
                        v-if="error.schemaPath"
                        class="font-mono text-xs text-gray-600 dark:text-gray-400"
                      >
                        {{ error.schemaPath }}
                      </span>
                    </div>
                    <p class="mb-2 text-sm text-red-700 dark:text-red-300">
                      {{ error.message }}
                    </p>
                    <div
                      v-if="error.params"
                      class="p-2 font-mono text-xs text-red-600 bg-red-100 rounded dark:text-red-400 dark:bg-red-900/50"
                    >
                      {{ t("tools.schemaValidator.params") }}:
                      {{ JSON.stringify(error.params) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schema Info -->
      <div v-if="schemaInfo" class="p-6 mt-6 card">
        <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {{ t("tools.schemaValidator.schemaInfo") }}
        </h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="text-center">
            <div class="text-2xl font-bold text-brand-blue">
              {{ schemaInfo.properties }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ t("tools.jsonlint.properties") }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-brand-blue">
              {{ schemaInfo.required }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ t("tools.schemaValidator.required") }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-brand-blue">
              {{ schemaInfo.types }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ t("tools.schemaValidator.types") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
