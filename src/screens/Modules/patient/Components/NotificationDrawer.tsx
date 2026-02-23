import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  X,
  Bell,
  Calendar,
  MessageSquare,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react-native';
import { usePatientUI } from './PatientUIContext';

interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'alert' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  date?: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Sarah Johnson has been confirmed for May 25, 2024 at 10:00 AM.',
    time: '2 hours ago',
    date: 'Today',
    read: false,
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Appointment Reminder',
    message: 'You have an appointment tomorrow at 10:30 AM with Dr. Michael Chen.',
    time: '5 hours ago',
    date: 'Today',
    read: false,
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message from Dr. Johnson',
    message: 'Please bring your medical records to your next appointment.',
    time: '1 day ago',
    date: 'Yesterday',
    read: true,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Appointment Cancelled',
    message: 'Your appointment on May 18, 2024 has been cancelled. Please reschedule.',
    time: '2 days ago',
    date: 'May 16',
    read: true,
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Booking Successful',
    message: 'You have successfully booked an appointment with Dr. Emily Walker.',
    time: '3 days ago',
    date: 'May 15',
    read: true,
  },
];

export const NotificationDrawer = () => {
  const { isNotificationDrawerOpen, closeNotificationDrawer } = usePatientUI();
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

  if (!isNotificationDrawerOpen) return null;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar size={20} color="#3B82F6" />;
      case 'message':
        return <MessageSquare size={20} color="#10B981" />;
      case 'alert':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'reminder':
        return <Bell size={20} color="#F59E0B" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getIconBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return '#DBEAFE';
      case 'message':
        return '#D1FAE5';
      case 'alert':
        return '#FEE2E2';
      case 'reminder':
        return '#FEF3C7';
      default:
        return '#F3F4F6';
    }
  };

  const filteredNotifications = selectedTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = notification.date || 'Other';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <View className="absolute right-0 top-0 bottom-0 bg-white w-full h-full z-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={closeNotificationDrawer} className="mr-4">
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900 flex-1">
          Notifications
        </Text>
        {notifications.filter(n => !n.read).length > 0 && (
          <View className="bg-red-500 rounded-full px-2 py-0.5 min-w-[20px] items-center">
            <Text className="text-white text-xs font-semibold">
              {notifications.filter(n => !n.read).length}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="px-5 pt-4 pb-2 border-b border-gray-200">
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => setSelectedTab('all')}
            className="flex-1 pb-3 items-center mr-4"
          >
            <Text
              className={`text-base font-medium ${selectedTab === 'all' ? 'text-gray-900' : 'text-gray-400'
                }`}
            >
              All
            </Text>
            {selectedTab === 'all' && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedTab('unread')}
            className="flex-1 pb-3 items-center"
          >
            <View className="flex-row items-center">
              <Text
                className={`text-base font-medium ${selectedTab === 'unread' ? 'text-gray-900' : 'text-gray-400'
                  }`}
              >
                Unread
              </Text>
              {notifications.filter(n => !n.read).length > 0 && (
                <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-2">
                  <Text className="text-white text-xs font-semibold">
                    {notifications.filter(n => !n.read).length}
                  </Text>
                </View>
              )}
            </View>
            {selectedTab === 'unread' && (
              <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {Object.keys(groupedNotifications).length > 0 ? (
          Object.entries(groupedNotifications).map(([date, notifs]) => (
            <View key={date} className="mb-4">
              {/* Date Header */}
              <View className="px-5 py-2">
                <Text className="text-xs font-semibold text-gray-500 uppercase">
                  {date}
                </Text>
              </View>

              {/* Notifications for this date */}
              {notifs.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  className={`flex-row px-5 py-4 ${!notification.read ? 'bg-blue-50' : 'bg-white'
                    } border-b border-gray-100`}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: getIconBgColor(notification.type) }}
                  >
                    {getIcon(notification.type)}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text
                        className={`text-sm font-semibold flex-1 ${!notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 rounded-full bg-blue-600 ml-2 mt-1" />
                      )}
                    </View>

                    <Text
                      className={`text-sm mb-2 ${!notification.read ? 'text-gray-700' : 'text-gray-500'
                        }`}
                      numberOfLines={2}
                    >
                      {notification.message}
                    </Text>

                    <Text className="text-xs text-gray-400">
                      {notification.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Bell size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-base text-center mb-2">
              No {selectedTab === 'unread' ? 'unread ' : ''}notifications
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              {selectedTab === 'unread'
                ? "You're all caught up!"
                : 'Notifications will appear here'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationDrawer;
