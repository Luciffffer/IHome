'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { useState } from 'react';
import FastActionsList from './fast-actions-list';
import { Separator } from '@/components/ui/separator';
import GlobalScenesList from './global-scenes-list';
import MyScenesList from './my-scenes-list';

type SceneTab = 'global' | 'fast' | 'mine';

function ScenesList() {
  const [activeTab, setActiveTab] = useState<SceneTab>('fast');

  return (
    <>
      <Tabs
        defaultValue={activeTab}
        onValueChange={value => setActiveTab(value as SceneTab)}
      >
        <TabsList className="w-full">
          <TabsTrigger value="fast">Fast</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="mine">Mine</TabsTrigger>
        </TabsList>
        <Separator
          orientation="horizontal"
          className="my-3 bg-border -mx-4 !w-auto"
        />
        <TabsContent value="fast">
          <FastActionsList />
        </TabsContent>
        <TabsContent value="global">
          <GlobalScenesList />
        </TabsContent>
        <TabsContent value="mine">
          <MyScenesList />
        </TabsContent>
      </Tabs>
    </>
  );
}

export default ScenesList;
