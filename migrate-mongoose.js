const fs = require('fs');
const path = require('path');

// Patterns to replace
const patterns = [
  // save() callbacks
  {
    pattern: /(\w+)\.save\(function\(\w*err\w*\)\s*\{([^}]+)\}\);/g,
    replacement: (match, model, body) => {
      const hasError = body.includes('err');
      if (hasError) {
        return `try {\n  await ${model}.save();\n  ${extractSuccessCode(body)}\n} catch(err) {\n  ${extractErrorCode(body)}\n}`;
      } else {
        return `await ${model}.save();\n${extractSuccessCode(body)}`;
      }
    }
  },
  // find() callbacks
  {
    pattern: /(\w+)\.find\(([^,]+),\s*function\(\w*err\w*,\s*(\w+)\)\s*\{([^}]+)\}\)/g,
    replacement: (match, model, query, resultVar, body) => {
      return `try {\n  const ${resultVar} = await ${model}.find(${query});\n  ${extractSuccessCode(body, resultVar)}\n} catch(err) {\n  ${extractErrorCode(body)}\n}`;
    }
  },
  // findOne() callbacks
  {
    pattern: /(\w+)\.findOne\(([^,]+),\s*function\(\w*err\w*,\s*(\w+)\)\s*\{([^}]+)\}\)/g,
    replacement: (match, model, query, resultVar, body) => {
      return `try {\n  const ${resultVar} = await ${model}.findOne(${query});\n  if(!${resultVar}) {\n    return res.status(404).send('Not found');\n  }\n  ${extractSuccessCode(body, resultVar)}\n} catch(err) {\n  ${extractErrorCode(body)}\n}`;
    }
  }
];

function extractSuccessCode(body, resultVar = '') {
  // Extract code that runs on success (after error check)
  const lines = body.split('\n');
  let successCode = '';
  let inElse = false;
  
  for (let line of lines) {
    if (line.includes('if') && line.includes('err')) {
      continue;
    }
    if (line.includes('} else {')) {
      inElse = true;
      continue;
    }
    if (inElse || !line.includes('err')) {
      successCode += line + '\n';
    }
  }
  
  return successCode.trim();
}

function extractErrorCode(body) {
  // Extract error handling code
  const lines = body.split('\n');
  let errorCode = '';
  let inError = false;
  
  for (let line of lines) {
    if (line.includes('if') && line.includes('err')) {
      inError = true;
      continue;
    }
    if (line.includes('} else {')) {
      inError = false;
    }
    if (inError && !line.includes('if') && !line.includes('}')) {
      errorCode += line + '\n';
    }
  }
  
  return errorCode.trim() || 'console.error(err); res.status(500).send(err);';
}

function addAsyncToFunction(content) {
  // Add async to function declarations that don't have it but use await
  return content.replace(
    /(\.(?:get|post|put|delete)\s*\(\s*function\s*\([^)]*\)\s*\{)/g,
    (match) => match.replace('function', 'async function')
  );
}

function migrateFile(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply patterns
  for (let pattern of patterns) {
    content = content.replace(pattern.pattern, pattern.replacement);
  }
  
  // Add async to functions that need it
  content = addAsyncToFunction(content);
  
  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Updated ${filePath}`);
}

// Find all JS files in routes directory
const routesDir = path.join(__dirname, 'routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

console.log('Starting Mongoose callback migration...\n');

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  try {
    migrateFile(filePath);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ Migration complete!');
console.log('Please review the changes and test your application.');
