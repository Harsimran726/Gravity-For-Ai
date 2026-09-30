import * as React from 'react';
import { AcceptInviteClient } from './accept-invite-client';

export default function AcceptInvitePage({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  return <AcceptInviteClient token={searchParams.token || ''} email={searchParams.email || ''} />;
}
