import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Save, Mail, Lock, CreditCard, Bell } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"account" | "email" | "billing" | "notifications">("account");

  // Account Settings State
  const [accountName, setAccountName] = useState(user?.name || "");
  const [accountEmail, setAccountEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Email Configuration State
  const [senderEmail, setSenderEmail] = useState("noreply@mailcraft.io");
  const [senderName, setSenderName] = useState("MailCraft");
  const [replyToEmail, setReplyToEmail] = useState(user?.email || "");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");

  // Billing State
  const [currentPlan, setCurrentPlan] = useState("Pro");
  const [billingEmail, setBillingEmail] = useState(user?.email || "");

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [campaignNotifications, setCampaignNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const handleSaveAccount = () => {
    if (!accountName || !accountEmail) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Account settings saved!");
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveEmailConfig = () => {
    if (!senderEmail || !senderName) {
      toast.error("Please fill in sender information");
      return;
    }
    toast.success("Email configuration saved!");
  };

  const handleSaveBilling = () => {
    toast.success("Billing settings saved!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account, email configuration, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("account")}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === "account"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Account
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === "email"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Email Configuration
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === "billing"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Billing
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === "notifications"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Notifications
        </button>
      </div>

      {/* Account Settings Tab */}
      {activeTab === "account" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail size={20} />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Full Name</Label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="mt-2 bg-input text-foreground border-border"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label className="text-foreground">Email Address</Label>
                <Input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  className="mt-2 bg-input text-foreground border-border"
                  placeholder="your@email.com"
                />
              </div>

              <Button
                onClick={handleSaveAccount}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save size={18} />
                Save Changes
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock size={20} />
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-2 bg-input text-foreground border-border"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <Label className="text-foreground">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 bg-input text-foreground border-border"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <Label className="text-foreground">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 bg-input text-foreground border-border"
                  placeholder="Confirm new password"
                />
              </div>

              <Button
                onClick={handleChangePassword}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Lock size={18} />
                Update Password
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Email Configuration Tab */}
      {activeTab === "email" && (
        <Card className="p-6 border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Email Configuration</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-foreground">Sender Email Address</Label>
              <Input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
                placeholder="noreply@yourdomain.com"
              />
              <p className="text-xs text-muted-foreground mt-1">Emails will be sent from this address</p>
            </div>

            <div>
              <Label className="text-foreground">Sender Name</Label>
              <Input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
                placeholder="Your Company Name"
              />
              <p className="text-xs text-muted-foreground mt-1">How your name appears in recipient inboxes</p>
            </div>

            <div>
              <Label className="text-foreground">Reply-To Email</Label>
              <Input
                type="email"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
                placeholder="support@yourdomain.com"
              />
              <p className="text-xs text-muted-foreground mt-1">Where replies will be sent</p>
            </div>

            <div>
              <Label className="text-foreground">SMTP Port</Label>
              <Input
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
                placeholder="587"
              />
              <p className="text-xs text-muted-foreground mt-1">Usually 587 or 465</p>
            </div>

            <div>
              <Label className="text-foreground">SMTP Host</Label>
              <Input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div>
              <Label className="text-foreground">SMTP Username</Label>
              <Input
                value={smtpUsername}
                onChange={(e) => setSmtpUsername(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div className="lg:col-span-2">
              <Label className="text-foreground">SMTP Password</Label>
              <Input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                className="mt-2 bg-input text-foreground border-border"
                placeholder="Enter SMTP password"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveEmailConfig}
            className="mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save size={18} />
            Save Email Configuration
          </Button>
        </Card>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              Current Plan
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold text-foreground mt-2">{currentPlan}</p>
                <p className="text-sm text-muted-foreground mt-2">$99/month</p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-foreground">✓ Unlimited campaigns</p>
                <p className="text-foreground">✓ 100,000 subscribers</p>
                <p className="text-foreground">✓ Advanced analytics</p>
                <p className="text-foreground">✓ Priority support</p>
              </div>

              <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                Upgrade Plan
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Billing Information</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Billing Email</Label>
                <Input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="mt-2 bg-input text-foreground border-border"
                />
              </div>

              <div>
                <Label className="text-foreground">Payment Method</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg border border-border">
                  <p className="text-foreground font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>

              <Button
                onClick={handleSaveBilling}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save size={18} />
                Save Billing Info
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card className="p-6 border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell size={20} />
            Notification Preferences
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Campaign Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when campaigns are sent or scheduled</p>
              </div>
              <input
                type="checkbox"
                checked={campaignNotifications}
                onChange={(e) => setCampaignNotifications(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of your campaigns</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveNotifications}
            className="mt-6 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save size={18} />
            Save Preferences
          </Button>
        </Card>
      )}
    </div>
  );
}
