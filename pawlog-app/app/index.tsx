import { Redirect } from 'expo-router';

export default function Index() {
  // Simply redirect to welcome. The auth screens will redirect to / (which redirects here, wait, no to /(tabs)) upon success.
  // Wait, if / redirects to /welcome, how do we get to (tabs)? We should use router.replace('/(tabs)') from auth.
  return <Redirect href={"/(auth)/welcome" as any} />;
}
