import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AdminDataProvider } from "../../context/AdminDataContext";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AdminDataProvider>
        <Drawer
          screenOptions={{
            headerStyle: { backgroundColor: "#007BFF" },
            headerTitleStyle: { color: "white", fontWeight: "bold" },
            headerTintColor: "white",
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: "Dashboard",
              title: "Dashboard",
              headerTitle: "Dashboard",
            }}
          />
          <Drawer.Screen
            name="subjects"
            options={{
              drawerLabel: "Subjects",
              title: "Subjects",
              headerTitle: "Subjects",
            }}
          />
          <Drawer.Screen
            name="classes"
            options={{
              drawerLabel: "Classes",
              title: "Classes",
              headerTitle: "Classes",
            }}
          />
          <Drawer.Screen
            name="teachers"
            options={{
              drawerLabel: "Teachers",
              title: "Teachers",
              headerTitle: "Teachers",
            }}
          />
          <Drawer.Screen
            name="admins"
            options={{
              drawerLabel: "Admins",
              title: "Admins",
              headerTitle: "Admins",
            }}
          />
          <Drawer.Screen
            name="parents"
            options={{
              drawerLabel: "Parents",
              title: "Parents",
              headerTitle: "Parents",
            }}
          />
          <Drawer.Screen
            name="students"
            options={{
              drawerLabel: "Students",
              title: "Students",
              headerTitle: "Students",
            }}
          />
          <Drawer.Screen
            name="events"
            options={{
              drawerLabel: "Events",
              title: "Events",
              headerTitle: "Events",
            }}
          />
          <Drawer.Screen
            name="news"
            options={{
              drawerLabel: "News",
              title: "News",
              headerTitle: "News",
            }}
          />
          <Drawer.Screen
            name="tables"
            options={{
              drawerLabel: "Tables",
              title: "Tables",
              headerTitle: "Tables",
            }}
          />
        </Drawer>
      </AdminDataProvider>
    </GestureHandlerRootView>
  );
}
