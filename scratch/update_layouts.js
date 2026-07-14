const fs = require('fs');
const path = require('path');

const projectRoot = '/home/zenoguy/Desktop/projects/SNPolymers/frontend/src/pages';

const filesToUpdate = [
  'MaterialMaster.jsx',
  'Estimates.jsx',
  'Requisitions.jsx',
  'DailyProgress.jsx',
  'FundRequests.jsx',
  'RAFinalBill.jsx',
  'UserMappings.jsx',
  'WorkOrderMappings.jsx',
  'ZonalBalances.jsx',
  'ExcessFundReturns.jsx',
  'admin/AdminPanel.jsx',
  'admin/MasterData.jsx',
  'admin/PurchaseOptions.jsx',
  'admin/AuditLog.jsx'
];

filesToUpdate.forEach(fileRelPath => {
  const filePath = path.join(projectRoot, fileRelPath);
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if TopNavbar is already imported
  if (content.includes('TopNavbar')) {
    console.log(`Skipping (already updated): ${fileRelPath}`);
    return;
  }

  // 1. Add TopNavbar Import
  const sidebarImportRegex = /import\s+Sidebar\s*,\s*\{\s*MobileHeader\s*\}\s+from\s+['"]([^'"]+)['"];/;
  const match = content.match(sidebarImportRegex);
  if (!match) {
    console.error(`Could not find Sidebar import in ${fileRelPath}`);
    return;
  }

  const importPath = match[1]; // e.g. "../components/Sidebar" or "../../components/Sidebar"
  const topNavbarImportPath = importPath.replace('Sidebar', 'TopNavbar');
  const newImport = `import Sidebar, { MobileHeader } from '${importPath}';\nimport TopNavbar from '${topNavbarImportPath}';`;
  content = content.replace(sidebarImportRegex, newImport);

  // 2. Wrap <main> tag
  // We locate '<main' and '</main>'
  const mainIndex = content.indexOf('<main');
  const closingMainIndex = content.lastIndexOf('</main>');

  if (mainIndex === -1 || closingMainIndex === -1) {
    console.error(`Could not locate <main> or </main> tags in ${fileRelPath}`);
    return;
  }

  // Slice content
  const beforeMain = content.slice(0, mainIndex);
  const mainPart = content.slice(mainIndex, closingMainIndex + 7);
  const afterMain = content.slice(closingMainIndex + 7);

  const wrappedMain = `<div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        <TopNavbar />
        ${mainPart}
      </div>`;

  const newContent = beforeMain + wrappedMain + afterMain;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully updated: ${fileRelPath}`);
});
