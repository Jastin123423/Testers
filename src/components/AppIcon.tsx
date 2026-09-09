import React from 'react';
import { 
  FileText, 
  Video, 
  Briefcase, 
  Music, 
  FolderLock, 
  Calculator, 
  Smartphone,
  LucideProps 
} from 'lucide-react';

interface AppIconProps extends LucideProps {
  name: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className = 'w-6 h-6', ...props }) => {
  switch (name) {
    case 'file-text':
      return <FileText className={className} {...props} />;
    case 'video':
      return <Video className={className} {...props} />;
    case 'briefcase':
      return <Briefcase className={className} {...props} />;
    case 'music':
      return <Music className={className} {...props} />;
    case 'folder-lock':
      return <FolderLock className={className} {...props} />;
    case 'calculator':
      return <Calculator className={className} {...props} />;
    default:
      return <Smartphone className={className} {...props} />;
  }
};
