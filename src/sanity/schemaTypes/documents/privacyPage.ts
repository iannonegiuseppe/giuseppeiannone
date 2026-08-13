import { defineSimplePageType } from "./simplePage";

export const privacyPage = defineSimplePageType({
  name: "privacyPage",
  title: "Privacy page",
  withLastUpdated: true,
});
