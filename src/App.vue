<script setup>
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";

import PartDumper from "./components/PartDumper.vue";
</script>

<template>
    <Tabs value="0">
        <TabList class="relative">
            <img alt="Yamaha XG" src="/img/xg-logo.png" class="absolute top-0 left-0 h-10 z-10 transform -translate-y-1/2 top-1/2" />
            <div class="mx-auto">
                <Tab value="0">Part Dumper</Tab>
                <Tab value="1">Header II</Tab>
                <Tab value="2">Header III</Tab>
            </div>
        </TabList>
        <TabPanels>
            <TabPanel value="0">
                <PartDumper />
            </TabPanel>
            <TabPanel value="1">
                <p class="m-0">
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                    totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
                    dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
                    sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci
                    velit, sed quia non numquam eius modi.
                </p>
            </TabPanel>
            <TabPanel value="2">
                <p class="m-0">
                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum
                    deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non
                    provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum
                    fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis
                    est eligendi optio cumque nihil impedit quo minus.
                </p>
            </TabPanel>
        </TabPanels>
    </Tabs>
</template>

<script setup></script>

<style lang="scss" scoped></style>
