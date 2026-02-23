import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Bell, X, Check, Trash2, Calendar, Clock, Info } from 'lucide-react-native';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';

interface NotificationDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment':
      return <Calendar size={18} color="#10B981" />;
    case 'reminder':
      return <Clock size={18} color="#F59E0B" />;
    case 'system':
      return <Info size={18} color="#3B82F6" />;
    default:
      return <Bell size={18} color="#6B7280" />;
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const NotificationDrawer = ({ visible, onClose }: NotificationDrawerProps) => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  useEffect(() => {
    if (visible) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [visible, fetchNotifications, fetchUnreadCount]);

  const handleNotificationPress = async (notification: typeof notifications[0]) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <TouchableOpacity className="flex-1" onPress={onClose} activeOpacity={1} />
        
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
            <View className="flex-row items-center">
              <Bell size={22} color="black" />
              <Text className="text-xl font-bold text-black ml-3">Notifications</Text>
              {unreadCount > 0 && (
                <View className="bg-red-500 px-2 py-0.5 rounded-full ml-2">
                  <Text className="text-white text-xs font-bold">{unreadCount}</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAllAsRead} className="mr-4">
                  <Text className="text-blue-500 text-sm font-medium">Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#000000" />
              <Text className="text-gray-500 mt-2">Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View className="py-12 items-center px-5">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Bell size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 text-lg font-semibold mb-1">No notifications</Text>
              <Text className="text-gray-500 text-center">You're all caught up! Check back later for updates.</Text>
            </View>
          ) : (
            <ScrollView className="max-h-[60vh]" showsVerticalScrollIndicator={false}>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  className={`flex-row p-4 border-b border-gray-50 active:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className={`font-semibold text-base ${!notification.read ? 'text-black' : 'text-gray-700'}`}>
                        {notification.title}
                      </Text>
                      <Text className="text-xs text-gray-400">{formatTime(notification.createdAt)}</Text>
                    </View>
                    <Text className="text-gray-600 text-sm" numberOfLines={2}>
                      {notification.message}
                    </Text>
                  </View>
                  {!notification.read && (
                    <View className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};
