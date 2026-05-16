import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import {
  Phone, MessageCircle, Bell, StickyNote, Send, X, Check, ChevronDown, Flame
} from 'lucide-react';

const WHATSAPP_TEMPLATES = [
  { label: 'Follow-up', text: (name) => `Hi ${name}! 😊 Following up on your visit to Bindu Jewellery. Would you like to come in and take a look at our latest collection?` },
  { label: 'New Collection', text: (name) => `Hi ${name}! 🌟 We just received a beautiful new collection at Bindu Jewellery. We thought you'd love it! Come visit us soon.` },
  { label: 'Reminder', text: (name) => `Hi ${name}! A gentle reminder about your upcoming occasion — we have the perfect pieces waiting for you at Bindu Jewellery. 💍` },
  { label: 'Custom', text: () => '' },
];

export default function CustomerQuickActions({ customer }) {
  const queryClient = useQueryClient();
  const phone = customer?.phone?.replace(/[^0-9]/g, '') || '';
  const leadId = customer?.leads?.[0]?.id;

  const [panel, setPanel] = useState(null); // 'reminder' | 'note' | 'whatsapp'
  const [reminder, setReminder] = useState({ date: '', note: '', type: 'call' });
  const [note, setNote] = useState('');
  const [waTemplate, setWaTemplate] = useState(0);
  const [waCustom, setWaCustom] = useState('');
  const [success, setSuccess] = useState('');

  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2500); };

  // Add reminder follow-up
  const reminderMutation = useMutation({
    mutationFn: (d) => api.post('/leads/followups/', d),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer', customer.id]);
      setReminder({ date: '', note: '', type: 'call' });
      setPanel(null);
      flash('Reminder saved!');
    },
  });

  // Quick note on timeline
  const noteMutation = useMutation({
    mutationFn: (d) => api.post(`/leads/customers/${customer.id}/add-timeline-event/`, d),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer', customer.id]);
      setNote('');
      setPanel(null);
      flash('Note added!');
    },
  });

  const handleReminder = () => {
    if (!reminder.date) return;
    const payload = { scheduled_date: reminder.date, note: reminder.note, followup_type: reminder.type };
    if (leadId) payload.lead = leadId;
    reminderMutation.mutate(payload);
  };

  const handleNote = () => {
    if (!note.trim()) return;
    noteMutation.mutate({ event_type: 'note', details: { note } });
  };

  const waText = waTemplate === 3 ? waCustom : WHATSAPP_TEMPLATES[waTemplate].text(customer?.name || '');
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(waText)}`;

  const toggle = (p) => setPanel(prev => prev === p ? null : p);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-[#C9972A]/5 overflow-hidden ring-1 ring-gray-900/5">
      {/* Action Buttons Row */}
      <div className="flex sm:grid sm:grid-cols-5 divide-x divide-gray-100/50 overflow-x-auto hide-scrollbar">
        {/* Call */}
        <a
          href={`tel:${phone}`}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-5 hover:bg-blue-50/80 transition-all duration-300 group min-w-[80px]"
        >
          <div className="w-12 h-12 bg-blue-100/50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:-translate-y-1 transition-all duration-300">
            <Phone size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-600 transition-colors">Call</span>
        </a>

        {/* WhatsApp */}
        <button
          onClick={() => toggle('whatsapp')}
          className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 transition-all duration-300 group min-w-[80px] ${panel === 'whatsapp' ? 'bg-green-50/80' : 'hover:bg-green-50/80'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-green-500/30 ${panel === 'whatsapp' ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 -translate-y-1' : 'bg-green-100/50 text-green-600 group-hover:bg-green-600 group-hover:text-white'}`}>
            <MessageCircle size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-green-600 transition-colors">WhatsApp</span>
        </button>

        {/* Reminder */}
        <button
          onClick={() => toggle('reminder')}
          className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 transition-all duration-300 group min-w-[80px] ${panel === 'reminder' ? 'bg-amber-50/80' : 'hover:bg-amber-50/80'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-[#C9972A]/30 ${panel === 'reminder' ? 'bg-[#C9972A] text-white shadow-lg shadow-[#C9972A]/30 -translate-y-1' : 'bg-amber-100/50 text-amber-600 group-hover:bg-[#C9972A] group-hover:text-white'}`}>
            <Bell size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-amber-600 transition-colors">Reminder</span>
        </button>

        {/* Note */}
        <button
          onClick={() => toggle('note')}
          className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 transition-all duration-300 group min-w-[80px] ${panel === 'note' ? 'bg-purple-50/80' : 'hover:bg-purple-50/80'}`}
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-purple-500/30 ${panel === 'note' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 -translate-y-1' : 'bg-purple-100/50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}`}>
            <StickyNote size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-purple-600 transition-colors">Note</span>
        </button>

        {/* Quick Interested */}
        <button
          onClick={() => {
            // 1. Set temperature to hot
            api.patch(`/leads/customers/${customer.id}/`, { temperature: 'hot' })
              .then(() => {
                // 2. Add Timeline Note
                noteMutation.mutate({ 
                  event_type: 'note', 
                  details: { note: 'Customer marked as interested via Quick Action.' } 
                });
                
                // 3. Schedule follow-up in 3 days
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                const payload = { 
                  scheduled_date: threeDaysFromNow.toISOString(), 
                  note: 'Auto-scheduled via Quick Interested button', 
                  followup_type: 'call' 
                };
                if (leadId) payload.lead = leadId;
                reminderMutation.mutate(payload);
                flash('Marked as Interested & Follow-up set!');
              });
          }}
          className="flex-1 flex flex-col items-center justify-center gap-2 py-5 hover:bg-orange-50/80 transition-all duration-300 group min-w-[80px]"
        >
          <div className="w-12 h-12 bg-orange-100/50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/30 group-hover:-translate-y-1 transition-all duration-300">
            <Flame size={20} className="group-hover:animate-bounce" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-orange-600 transition-colors">Interested</span>
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mx-4 mb-3 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl px-4 py-2.5">
          <Check size={14} /> {success}
        </div>
      )}

      {/* WhatsApp Panel */}
      {panel === 'whatsapp' && (
        <div className="border-t border-gray-100 p-5 bg-green-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Send WhatsApp Message</p>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1">
              <MessageCircle size={12} className="text-green-500" />
              <span className="text-xs font-semibold text-gray-700">{customer?.phone}</span>
            </div>
          </div>

          {/* Template selector */}
          <div className="grid grid-cols-2 gap-2">
            {WHATSAPP_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => setWaTemplate(i)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${waTemplate === i ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Message preview / custom input */}
          <textarea
            rows={3}
            value={waTemplate === 3 ? waCustom : waText}
            onChange={e => { setWaTemplate(3); setWaCustom(e.target.value); }}
            className="w-full text-sm rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none bg-white"
            placeholder="Type custom message..."
          />

          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors"
          >
            <MessageCircle size={16} /> Open WhatsApp
          </a>
        </div>
      )}

      {/* Reminder Panel */}
      {panel === 'reminder' && (
        <div className="border-t border-gray-100 p-5 bg-amber-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Add Next Reminder</p>
            {!leadId && <span className="text-xs text-red-400 font-medium">No lead linked</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase block mb-1">Type</label>
              <select
                value={reminder.type}
                onChange={e => setReminder(r => ({ ...r, type: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="call">📞 Call</option>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="visit">🏪 Visit</option>
                <option value="email">✉️ Email</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-semibold uppercase block mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={reminder.date}
                onChange={e => setReminder(r => ({ ...r, date: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-semibold uppercase block mb-1">Note (optional)</label>
            <input
              type="text"
              value={reminder.note}
              onChange={e => setReminder(r => ({ ...r, note: e.target.value }))}
              placeholder="e.g. Call about wedding collection..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setPanel(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReminder}
              disabled={!reminder.date || reminderMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#C9972A] hover:bg-amber-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Bell size={14} />
              {reminderMutation.isPending ? 'Saving...' : 'Save Reminder'}
            </button>
          </div>
        </div>
      )}

      {/* Note Panel */}
      {panel === 'note' && (
        <div className="border-t border-gray-100 p-5 bg-purple-50/50 space-y-4">
          <p className="text-sm font-bold text-gray-700">Add Quick Note</p>
          <textarea
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Customer interested in gold bangles, prefers 22kt..."
            className="w-full text-sm rounded-xl border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none bg-white"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setPanel(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleNote}
              disabled={!note.trim() || noteMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} />
              {noteMutation.isPending ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
