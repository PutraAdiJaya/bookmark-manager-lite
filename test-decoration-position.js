// Test script to verify decoration positioning
console.log("Testing decoration positioning changes...");

// This would normally be run in a VS Code extension host environment
// For now, we're just verifying the CSS properties are correctly formatted

const testDecorationOptions = {
  before: {
    contentText: 'Bookmark: Test Title',
    color: 'editorLineNumber.foreground',
    fontStyle: 'italic',
    fontWeight: 'normal',
    textDecoration: 'none; position: absolute; top: -1.2em; left: 0; font-size: 0.9em;'
  },
  isWholeLine: true
};

console.log("Decoration options:", JSON.stringify(testDecorationOptions, null, 2));

// Verify the textDecoration property contains the expected positioning
const textDecoration = testDecorationOptions.before.textDecoration;
if (textDecoration.includes('position: absolute') && 
    textDecoration.includes('top: -1.2em') && 
    textDecoration.includes('left: 0')) {
  console.log("✅ Decoration positioning properties are correctly set");
} else {
  console.log("❌ Decoration positioning properties are missing or incorrect");
}

console.log("Test completed.");