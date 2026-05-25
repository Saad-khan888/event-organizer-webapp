import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching data...');

      const [eventsList, reportsList, usersList] = await Promise.all([
        api.getEvents(),
        api.getReports(),
        api.getUsers()
      ]);

      console.log('📊 Users fetched:', usersList?.length || 0, usersList);
      console.log('📅 Events fetched:', eventsList?.length || 0);
      console.log('📰 Reports fetched:', reportsList?.length || 0);
      
      // Debug: Log report images
      if (reportsList && reportsList.length > 0) {
        reportsList.forEach((report, idx) => {
          if (report.images && report.images.length > 0) {
            console.log(`📰 Report ${idx + 1} images:`, report.images);
          }
        });
      }

      setEvents(eventsList || []);
      setReports(reportsList || []);
      setUsers(usersList || []);

      console.log('✅ Data loaded');
    } catch (err) {
      console.error('❌ Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData, user]);

  const addEvent = async (eventData) => {
    try {
      const data = await api.createEvent(eventData);
      setEvents((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to add event:', err);
      throw err;
    }
  };

  const updateEvent = async (id, data) => {
    try {
      const updated = await api.updateEvent(id, data);
      setEvents((prev) => prev.map((e) => (e._id === id ? updated : e)));
      return updated;
    } catch (err) {
      console.error('Failed to update event:', err);
      throw err;
    }
  };

  const addReport = async (reportData) => {
    try {
      const data = await api.createReport(reportData);
      setReports((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to add report:', err);
      throw err;
    }
  };

  const joinEvent = async (eventId) => {
    try {
      const updated = await api.joinEvent(eventId);
      // Update the event in local state - handle both _id and id fields
      setEvents((prev) => prev.map((e) => {
        const eId = e._id || e.id;
        const targetId = updated._id || updated.id;
        return String(eId) === String(targetId) ? updated : e;
      }));
      return { success: true, data: updated };
    } catch (err) {
      console.error('Failed to join event:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error('Delete event failed:', err);
      throw err;
    }
  };

  const deleteReport = async (id) => {
    try {
      await api.deleteReport(id);
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error('Delete report failed:', err);
      throw err;
    }
  };

  const clearAllData = () => {
    setEvents([]);
    setReports([]);
    setUsers([]);
    localStorage.clear();
    window.location.reload();
  };

  return (
    <DataContext.Provider value={{
      events, reports, users, loading,
      addEvent, updateEvent,
      addReport, joinEvent,
      deleteEvent, deleteReport,
      clearAllData,
      refreshData: fetchData
    }}>
      {children}
    </DataContext.Provider>
  );
};
