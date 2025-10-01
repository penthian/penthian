import { ContentSection } from "./ContentSection";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
interface Section {
  title: string;
  content: string | Record<string, any>;
}

interface PolicyDialogItemProps {
  dialogTitle: string;
  dialogContent: Section[];
}

export const PolicyDialogItem = ({
  dialogTitle,
  dialogContent,
}: PolicyDialogItemProps) => {
  return (
    <li>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-sm text-nowrap text-pitchBlack justify-start px-0 hover:px-1 text-pit" size='sm'>{dialogTitle}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl bg-white text-black h-3/4 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="mb-5 text-2xl">{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogContent.map((section, index) => (
                <ContentSection
                  key={index}
                  sectionTitle={section.title}
                  sectionContent={section.content}
                />
              ))}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </li>
  );
};
