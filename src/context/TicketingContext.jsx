import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const TicketingContext = createContext();

export const useTicketing = () => useContext(TicketingContext);

export const TicketingProvider = ({ children }) => {
  const { user } = useAuth();
  const [ticketTypes, setTicketTypes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's orders
  const fetchMyOrders = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getMyOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, [user]);

  // Fetch user's tickets
  const fetchMyTickets = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getMyTickets();
      setTickets(data || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyOrders();
      fetchMyTickets();
    }
  }, [user, fetchMyOrders, fetchMyTickets]);

  // Get ticket types for an event
  const getEventTicketTypes = async (eventId) => {
    try {
      const data = await api.getTicketTypes(eventId);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch ticket types:', error);
      return [];
    }
  };

  // Get payment methods for an event
  const getEventPaymentMethods = async (eventId) => {
    try {
      const data = await api.getPaymentMethods(eventId);
      return data || [];
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return [];
    }
  };

  // Create ticket type (organizers)
  const createTicketType = async (eventId, ticketTypeData) => {
    try {
      const data = await api.createTicketType(eventId, ticketTypeData);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to create ticket type:', error);
      return { success: false, error: error.message };
    }
  };

  // Update ticket type (organizers)
  const updateTicketType = async (ticketTypeId, ticketTypeData) => {
    try {
      const data = await api.updateTicketType(ticketTypeId, ticketTypeData);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to update ticket type:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete ticket type (organizers)
  const deleteTicketType = async (ticketTypeId) => {
    try {
      await api.deleteTicketType(ticketTypeId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete ticket type:', error);
      return { success: false, error: error.message };
    }
  };

  // Create payment method (organizers)
  const createPaymentMethod = async (eventId, methodData) => {
    try {
      const data = await api.createPaymentMethod(eventId, methodData);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to create payment method:', error);
      return { success: false, error: error.message };
    }
  };

  // Update payment method (organizers)
  const updatePaymentMethod = async (methodId, methodData) => {
    try {
      const data = await api.updatePaymentMethod(methodId, methodData);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to update payment method:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete payment method (organizers)
  const deletePaymentMethod = async (methodId) => {
    try {
      await api.deletePaymentMethod(methodId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      return { success: false, error: error.message };
    }
  };

  // Create order
  const createOrder = async (orderData) => {
    try {
      const data = await api.createOrder(orderData);
      await fetchMyOrders(); // Refresh orders
      return { success: true, data };
    } catch (error) {
      console.error('Failed to create order:', error);
      return { success: false, error: error.message };
    }
  };

  // Submit payment proof
  const submitPaymentProof = async (orderId, paymentDetails, proofFile) => {
    try {
      // First upload the proof image
      let proofUrl = null;
      if (proofFile instanceof File) {
        const formData = new FormData();
        formData.append('image', proofFile);
        
        const API_URL = import.meta.env.VITE_API_URL || 'https://event-organizer-webapp.onrender.com/api';
        
        const response = await fetch(`${API_URL.replace('/api', '')}/api/upload?folder=payment-proofs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload proof');
        }
        
        proofUrl = data.url;
      }
      
      // Then submit the payment proof with the image URL
      await api.submitPaymentProof(orderId, {
        payment_details: paymentDetails,
        payment_proof_url: proofUrl
      });
      
      await fetchMyOrders(); // Refresh orders
      return { success: true };
    } catch (error) {
      console.error('Failed to submit payment proof:', error);
      return { success: false, error: error.message };
    }
  };

  // Approve payment (organizers)
  const approvePayment = async (orderId) => {
    try {
      await api.approvePayment(orderId);
      await fetchMyOrders(); // Refresh orders
      return { success: true };
    } catch (error) {
      console.error('Failed to approve payment:', error);
      return { success: false, error: error.message };
    }
  };

  // Reject payment (organizers)
  const rejectPayment = async (orderId, reason) => {
    try {
      await api.rejectPayment(orderId, reason);
      await fetchMyOrders(); // Refresh orders
      return { success: true };
    } catch (error) {
      console.error('Failed to reject payment:', error);
      return { success: false, error: error.message };
    }
  };

  // Verify payment (approve or reject) - wrapper function
  const verifyPayment = async (orderId, action, reason = null) => {
    if (action === 'approve') {
      return await approvePayment(orderId);
    } else if (action === 'reject') {
      return await rejectPayment(orderId, reason);
    }
    return { success: false, error: 'Invalid action' };
  };

  // Validate ticket (organizers)
  const validateTicket = async (qrCode, eventId) => {
    try {
      const result = await api.validateTicket(qrCode, eventId);
      return result;
    } catch (error) {
      console.error('Failed to validate ticket:', error);
      return { valid: false, error: error.message };
    }
  };

  // Check if user has joined event (has active ticket)
  const hasJoinedEvent = (eventId) => {
    return tickets.some(ticket => 
      ticket.event === eventId || ticket.event?.id === eventId || ticket.event?._id === eventId
    );
  };

  // Get event participation status
  const getEventParticipationStatus = (eventId) => {
    const eventTickets = tickets.filter(ticket => 
      ticket.event === eventId || ticket.event?.id === eventId || ticket.event?._id === eventId
    );
    
    if (eventTickets.length === 0) return null;
    
    return {
      hasTickets: true,
      ticketCount: eventTickets.length,
      tickets: eventTickets
    };
  };

  // Get pending orders count
  const getPendingOrdersCount = () => {
    return orders.filter(order => 
      order.status === 'pending_payment' || order.status === 'pending_verification'
    ).length;
  };

  return (
    <TicketingContext.Provider value={{
      ticketTypes,
      paymentMethods,
      orders,
      tickets,
      loading,
      getEventTicketTypes,
      getEventPaymentMethods,
      createTicketType,
      updateTicketType,
      deleteTicketType,
      createPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      createOrder,
      submitPaymentProof,
      approvePayment,
      rejectPayment,
      verifyPayment,
      validateTicket,
      hasJoinedEvent,
      getEventParticipationStatus,
      getPendingOrdersCount,
      fetchMyOrders,
      fetchMyTickets
    }}>
      {children}
    </TicketingContext.Provider>
  );
};
