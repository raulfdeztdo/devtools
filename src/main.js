import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import i18n from "./i18n";
import "./style.css";

// Importar componentes de las páginas
import Home from "./views/Home.vue";
import JSONLint from "./views/JSONLint.vue";
import JSONSchemaValidator from "./views/JSONSchemaValidator.vue";
import UUIDGenerator from "./views/UUIDGenerator.vue";
import PasswordGenerator from "./views/PasswordGenerator.vue";
import TimestampConverter from "./views/TimestampConverter.vue";
import Base64Converter from "./views/Base64Converter.vue";
import URLConverter from "./views/URLConverter.vue";
import ColorPaletteGenerator from "./views/ColorPaletteGenerator.vue";
import PHPSerializer from "./views/PHPSerializer.vue";
import JSONCompare from "./views/JSONCompare.vue";
import HashGenerator from "./views/HashGenerator.vue";
import JwtDecoder from "./views/JwtDecoder.vue";
import HtmlEntityEncoder from "./views/HtmlEntityEncoder.vue";
import RegexTester from "./views/RegexTester.vue";
import SqlFormatter from "./views/SqlFormatter.vue";
import CssJsMinifier from "./views/CssJsMinifier.vue";
import LoremIpsum from "./views/LoremIpsum.vue";
import CronParser from "./views/CronParser.vue";
import HttpStatusCodes from "./views/HttpStatusCodes.vue";
import UserAgentParser from "./views/UserAgentParser.vue";
import FaviconGenerator from "./views/FaviconGenerator.vue";
import TextDiff from "./views/TextDiff.vue";
import CaseConverter from "./views/CaseConverter.vue";
import StringCounter from "./views/StringCounter.vue";
import QrGenerator from "./views/QrGenerator.vue";
import MarkdownPreview from "./views/MarkdownPreview.vue";
import YamlJsonConverter from "./views/YamlJsonConverter.vue";
import TomlJsonConverter from "./views/TomlJsonConverter.vue";
import XmlJsonConverter from "./views/XmlJsonConverter.vue";

// Configuración del router
const routes = [
    { path: "/", component: Home },
    { path: "/jsonlint", component: JSONLint },
    { path: "/json-schema-validator", component: JSONSchemaValidator },
    { path: "/uuid-generator", component: UUIDGenerator },
    { path: "/password-generator", component: PasswordGenerator },
    { path: "/timestamp-converter", component: TimestampConverter },
    { path: "/base64-converter", component: Base64Converter },
    { path: "/url-converter", component: URLConverter },
    { path: "/color-palette-generator", component: ColorPaletteGenerator },
    { path: "/php-serializer", component: PHPSerializer },
    { path: "/json-compare", component: JSONCompare },
    { path: "/hash-generator", component: HashGenerator },
    { path: "/jwt-decoder", component: JwtDecoder },
    { path: "/html-entity-encoder", component: HtmlEntityEncoder },
    { path: "/regex-tester", component: RegexTester },
    { path: "/sql-formatter", component: SqlFormatter },
    { path: "/css-js-minifier", component: CssJsMinifier },
    { path: "/lorem-ipsum", component: LoremIpsum },
    { path: "/cron-parser", component: CronParser },
    { path: "/http-status-codes", component: HttpStatusCodes },
    { path: "/user-agent-parser", component: UserAgentParser },
    { path: "/favicon-generator", component: FaviconGenerator },
    { path: "/text-diff", component: TextDiff },
    { path: "/case-converter", component: CaseConverter },
    { path: "/string-counter", component: StringCounter },
    { path: "/qr-generator", component: QrGenerator },
    { path: "/markdown-preview", component: MarkdownPreview },
    { path: "/yaml-json", component: YamlJsonConverter },
    { path: "/toml-json", component: TomlJsonConverter },
    { path: "/xml-json", component: XmlJsonConverter },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Crear y montar la aplicación
const app = createApp(App);
app.use(i18n);
app.use(router);
app.mount("#app");
