'use client';

import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact() {
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactForm) => {
    console.log('Contact form submitted:', data);
    // Mimic API post
    reset();
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Header */}
      <section className="bg-stone-100 py-16 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Contact Us</h1>
          <p className="text-stone-600 mt-2 max-w-lg mx-auto">Get in touch with our kitchen support staff for bespoke designs or special orders.</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Info panel */}
            <div className="lg:col-span-1 space-y-8 bg-stone-50 p-8 rounded-3xl border border-stone-200">
              <h2 className="text-2xl font-bold text-stone-900">Reach Us Directly</h2>
              <p className="text-stone-500 text-sm">We are open for custom designs consultation daily from 8:00 AM to 8:00 PM.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Our Location</h3>
                    <p className="text-stone-600 text-sm mt-1">Kathmandu, Nepal (Near Chocolate Tower)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Phone Line</h3>
                    <p className="text-stone-600 text-sm mt-1">+977 1-4234567</p>
                    <p className="text-stone-400 text-xs mt-0.5">Cell: +977 9841234567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-stone-200 text-stone-700 rounded-2xl">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Support Email</h3>
                    <p className="text-stone-600 text-sm mt-1">support@bakeryhub.com</p>
                    <p className="text-stone-400 text-xs mt-0.5">Response within 2 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div className="lg:col-span-2 space-y-6 bg-white p-8 rounded-3xl border border-stone-200">
              <h2 className="text-2xl font-bold text-stone-900">Send Us a Message</h2>
              
              {isSubmitSuccessful && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">
                  Thank you! Your message has been sent successfully. Our support team will write back shortly.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-stone-700 text-sm font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-rose-500' : 'border-stone-300'} focus:ring-rose-500 focus:border-rose-500 outline-none`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-rose-600 text-xs mt-1.5">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-stone-700 text-sm font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-rose-500' : 'border-stone-300'} focus:ring-rose-500 focus:border-rose-500 outline-none`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-rose-600 text-xs mt-1.5">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 text-sm font-semibold mb-2">Subject</label>
                  <input
                    type="text"
                    {...register('subject')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.subject ? 'border-rose-500' : 'border-stone-300'} focus:ring-rose-500 focus:border-rose-500 outline-none`}
                    placeholder="Bespoke Cake Quotation"
                  />
                  {errors.subject && <p className="text-rose-600 text-xs mt-1.5">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-stone-700 text-sm font-semibold mb-2">Detailed Message</label>
                  <textarea
                    rows={5}
                    {...register('message')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.message ? 'border-rose-500' : 'border-stone-300'} focus:ring-rose-500 focus:border-rose-500 outline-none`}
                    placeholder="Briefly describe what cake size, tier count, custom coloring, and delivery details you require..."
                  />
                  {errors.message && <p className="text-rose-600 text-xs mt-1.5">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-stone-900 hover:bg-rose-600 text-white font-semibold rounded-full shadow-md transition-colors w-full sm:w-auto"
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

          </div>
  );
}
