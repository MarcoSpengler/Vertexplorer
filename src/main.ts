import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import "./theme/semantics.css";

createApp(App).use(createPinia()).mount("#app");
