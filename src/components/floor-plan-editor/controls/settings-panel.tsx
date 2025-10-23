import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  SidePopupMenu,
  SidePopupMenuContent,
  SidePopupMenuHeader,
  SidePopupMenuTrigger,
} from '@/components/ui/side-popup-menu';
import { Settings } from 'lucide-react';

function SettingsPanel() {
  return (
    <SidePopupMenu>
      <SidePopupMenuTrigger>
        <Button
          variant="ghost"
          size="icon-lg"
          className="cursor-pointer *:[svg]:!w-5 *:[svg]:!h-5"
        >
          <Settings />
        </Button>
      </SidePopupMenuTrigger>
      <SidePopupMenuContent side="right" className="top-16 bottom-20">
        <SidePopupMenuHeader>
          <h2 className="font-heading-2xs">Floor Settings</h2>
        </SidePopupMenuHeader>
        <p className="mb-6">Adjust the general floor settings below.</p>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel>Floor Name</FieldLabel>
              <Input />
            </Field>
          </FieldGroup>
        </form>
      </SidePopupMenuContent>
    </SidePopupMenu>
  );
}

export default SettingsPanel;
