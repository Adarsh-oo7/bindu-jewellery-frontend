import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import useAuth from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield, Loader2, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Clock, GraduationCap, MessageCircle, Heart, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  whatsapp_number: z.string().optional().nullable(),
  marital_status: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
});

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = React.useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const profileForm = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      emergency_contact_name: user?.emergency_contact_name || '',
      emergency_contact_phone: user?.emergency_contact_phone || '',
      whatsapp_number: user?.whatsapp_number || '',
      marital_status: user?.marital_status || '',
      qualification: user?.qualification || '',
      date_of_birth: user?.date_of_birth || '',
    }
  });

  const completionStats = React.useMemo(() => {
    const fields = [
      user?.full_name, user?.phone, user?.address, user?.date_of_birth,
      user?.emergency_contact_name, user?.emergency_contact_phone,
      user?.whatsapp_number, user?.marital_status, user?.qualification
    ];
    const filled = fields.filter(f => !!f).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const passwordMutation = useMutation({
    mutationFn: (data) => api.post('/accounts/change-password/', data),
    onSuccess: () => {
      toast.success('Password updated successfully');
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update password');
    }
  });

  const profileMutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      return api.patch(`/accounts/me/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: (res) => {
      if (res.data.status === 'pending_approval') {
        toast.success(res.data.detail);
      } else {
        toast.success('Profile updated successfully');
        const updatedUser = { ...user, ...res.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (setUser) setUser(updatedUser);
        profileForm.reset({
          full_name: updatedUser.full_name || '',
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          emergency_contact_name: updatedUser.emergency_contact_name || '',
          emergency_contact_phone: updatedUser.emergency_contact_phone || '',
          whatsapp_number: updatedUser.whatsapp_number || '',
          marital_status: updatedUser.marital_status || '',
          qualification: updatedUser.qualification || '',
          date_of_birth: updatedUser.date_of_birth || '',
        });
        queryClient.invalidateQueries({ queryKey: ['team'] });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Account Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#C9972A] to-[#F0C84A] h-24"></div>
            <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center">
              <div className="relative -mt-12 mb-4 group">
                <div className="w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-sm">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-muted-foreground font-semibold">
                      {user?.full_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={14} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              <h2 className="text-xl font-bold">{user?.full_name}</h2>
              <p className="text-muted-foreground text-sm mb-4">{user?.email}</p>
              
              <div className="w-full flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="outline" className="capitalize">
                  {user?.display_role || user?.role}
                </Badge>
                <Badge variant="secondary">
                  {user?.branch_name || 'All Branches'}
                </Badge>
              </div>

              <div className="w-full px-6 mb-6">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Profile Completion</span>
                  <span className="font-bold">{completionStats}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${completionStats}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-full px-6 space-y-2">
                {user?.is_profile_verified ? (
                  <div className="flex items-center justify-center p-2 rounded-lg bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20">
                    <CheckCircle2 size={14} className="mr-2" /> PROFILE VERIFIED
                  </div>
                ) : user?.profile_completed ? (
                  <div className="flex items-center justify-center p-2 rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
                    <Clock size={14} className="mr-2" /> UNDER VERIFICATION
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 text-red-600 text-xs font-bold border border-red-500/20">
                    <AlertCircle size={14} className="mr-2" /> PROFILE INCOMPLETE
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-border p-4 bg-muted/20">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail size={16} className="mr-3 opacity-70" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone size={16} className="mr-3 opacity-70" />
                  <span>{user?.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-start text-sm text-muted-foreground">
                  <MapPin size={16} className="mr-3 mt-0.5 opacity-70 shrink-0" />
                  <span className="line-clamp-2">{user?.address || 'No address set'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 bg-muted/50 w-full justify-start rounded-lg p-1">
              <TabsTrigger value="profile" className="flex-1 md:flex-none">
                <User size={16} className="mr-2" /> Profile Information
              </TabsTrigger>
              <TabsTrigger value="security" className="flex-1 md:flex-none">
                <Shield size={16} className="mr-2" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="m-0">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>Update your personal information and contact details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={profileForm.handleSubmit((data) => profileMutation.mutate(data))} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" {...profileForm.register('full_name')} />
                        {profileForm.formState.errors.full_name && (
                          <p className="text-sm text-destructive">{profileForm.formState.errors.full_name.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...profileForm.register('phone')} />
                        {profileForm.formState.errors.phone && (
                          <p className="text-sm text-destructive">{profileForm.formState.errors.phone.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...profileForm.register('address')} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                        <div className="relative">
                          <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
                          <Input id="whatsapp_number" className="pl-10" placeholder="e.g. +91 9876543210" {...profileForm.register('whatsapp_number')} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Marital Status</Label>
                        <Select 
                          onValueChange={(val) => profileForm.setValue('marital_status', val)}
                          defaultValue={profileForm.getValues('marital_status')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="unmarried">Unmarried</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input type="date" id="date_of_birth" {...profileForm.register('date_of_birth')} />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="qualification">Highest Qualification</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" size={16} />
                          <Input id="qualification" className="pl-10" placeholder="e.g. Bachelor of Commerce" {...profileForm.register('qualification')} />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="font-medium text-sm mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergency_contact_name">Contact Name</Label>
                          <Input id="emergency_contact_name" {...profileForm.register('emergency_contact_name')} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                          <Input id="emergency_contact_phone" {...profileForm.register('emergency_contact_phone')} />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={profileMutation.isPending} className="bg-[#1A5490] hover:bg-[#0E3A6B]">
                        {profileMutation.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <Card className="shadow-sm border-destructive/20">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={passwordForm.handleSubmit((data) => passwordMutation.mutate(data))} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="old_password">Current Password</Label>
                      <Input id="old_password" type="password" {...passwordForm.register('old_password')} />
                      {passwordForm.formState.errors.old_password && (
                        <p className="text-sm text-destructive">{passwordForm.formState.errors.old_password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input id="new_password" type="password" {...passwordForm.register('new_password')} />
                      {passwordForm.formState.errors.new_password && (
                        <p className="text-sm text-destructive">{passwordForm.formState.errors.new_password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input id="confirm_password" type="password" {...passwordForm.register('confirm_password')} />
                      {passwordForm.formState.errors.confirm_password && (
                        <p className="text-sm text-destructive">{passwordForm.formState.errors.confirm_password.message}</p>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button type="submit" disabled={passwordMutation.isPending} variant="destructive">
                        {passwordMutation.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
