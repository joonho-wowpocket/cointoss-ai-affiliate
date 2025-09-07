import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminGuard } from './AdminGuard';

interface LeadCapture {
  id: string;
  lead_magnet_id: string;
  partner_id: string;
  contact_info: any;
  captured_at: string;
  source: string;
  ip_address: string;
  user_agent: string;
}

export function LeadContactsViewer() {
  const [leads, setLeads] = useState<LeadCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadCapture | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);

  const fetchLeads = async (masked = true) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-lead-contacts', {
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) throw error;
      setLeads(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message || 'Failed to fetch lead contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(true);
  }, []);

  const toggleSensitiveView = async () => {
    setLoading(true);
    await fetchLeads(!showSensitive);
    setShowSensitive(!showSensitive);
  };

  const formatContactInfo = (contactInfo: any) => {
    if (!contactInfo) return 'No contact info';
    
    const fields = [];
    if (contactInfo.email || contactInfo.email_masked) {
      fields.push(`Email: ${contactInfo.email || contactInfo.email_masked}`);
    }
    if (contactInfo.phone || contactInfo.phone_masked) {
      fields.push(`Phone: ${contactInfo.phone || contactInfo.phone_masked}`);
    }
    if (contactInfo.telegram || contactInfo.telegram_masked) {
      fields.push(`Telegram: ${contactInfo.telegram || contactInfo.telegram_masked}`);
    }
    if (contactInfo.name) {
      fields.push(`Name: ${contactInfo.name}`);
    }
    if (contactInfo.company) {
      fields.push(`Company: ${contactInfo.company}`);
    }
    
    return fields.length > 0 ? fields.join(', ') : 'No contact info';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminGuard roles={['SuperAdmin', 'Ops', 'Compliance']}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Lead Contact Information
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={showSensitive ? "destructive" : "outline"}
                size="sm"
                onClick={toggleSensitiveView}
                className="flex items-center gap-2"
              >
                {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSensitive ? 'Hide Sensitive' : 'Show Sensitive'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchLeads(!showSensitive)}>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showSensitive && (
            <Alert className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Sensitive data is now visible. This action has been logged for security auditing.
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Partner ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No lead captures found
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        {new Date(lead.captured_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.source}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {formatContactInfo(lead.contact_info)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {lead.partner_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.contact_info?.error ? 'destructive' : 'default'}>
                          {lead.contact_info?.error ? 'Encrypted' : 'Accessible'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedLead(lead)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Lead Capture Details</DialogTitle>
                            </DialogHeader>
                            {selectedLead && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Capture Date:</label>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(selectedLead.captured_at).toLocaleString('ko-KR')}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Source:</label>
                                    <p className="text-sm text-muted-foreground">{selectedLead.source}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">IP Address:</label>
                                    <p className="text-sm text-muted-foreground">{selectedLead.ip_address}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Partner ID:</label>
                                    <p className="text-sm text-muted-foreground font-mono">{selectedLead.partner_id}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Contact Information:</label>
                                  <div className="mt-2 p-3 bg-muted rounded-lg">
                                    {selectedLead.contact_info ? (
                                      <pre className="text-xs">
                                        {JSON.stringify(selectedLead.contact_info, null, 2)}
                                      </pre>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No contact information available</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">User Agent:</label>
                                  <p className="text-xs text-muted-foreground break-all">
                                    {selectedLead.user_agent}
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              * Contact information is encrypted at rest. Access to sensitive data is logged and monitored.
            </p>
            <p>
              * Only authorized administrators can view decrypted contact information.
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminGuard>
  );
}