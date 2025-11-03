'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchGlobalScenes, fetchMyScenes } from '@/contexts/scenes/api';
import { sceneKeys } from '@/contexts/scenes/keys';
import { TabsContent } from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import FastActionsList from './fast-actions-list';
import { Separator } from '@/components/ui/separator';
import GlobalScenesList from './global-scenes-list';

type SceneTab = 'global' | 'fast' | 'mine';

function ScenesList() {
  const [activeTab, setActiveTab] = useState<SceneTab>('fast');
  const session = useSession();

  const userId = session.data?.user?.id || '';

  // Fetch global scenes

  // const { data: myScenes = [], status: myScenesStatus } = useQuery({
  //   queryKey: sceneKeys.mine(userId),
  //   queryFn: fetchMyScenes,
  //   enabled: activeTab === 'mine' && !!userId,
  //   staleTime: 0,
  //   refetchOnWindowFocus: true,
  // });

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
          {/* Content for My scenes */}
          <div>My Scenes Content</div>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default ScenesList;
