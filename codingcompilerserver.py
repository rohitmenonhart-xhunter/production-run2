import json
from typing import Dict, Any, Optional
import traceback
from RestrictedPython import compile_restricted
from RestrictedPython import safe_globals
from io import StringIO
import contextlib

def run_python(code: str, input_data: Optional[str] = None) -> Dict[str, Any]:
    """Execute Python code in a safe environment using RestrictedPython."""
    try:
        # Create string buffer for output
        output = StringIO()
        
        # Create safe globals with print function
        safe_locals = {}
        restricted_globals = dict(safe_globals)
        restricted_globals['_print_'] = lambda *args, **kwargs: print(*args, file=output, **kwargs)
        restricted_globals['_getattr_'] = getattr
        
        # Add input data to globals if provided
        if input_data:
            restricted_globals['input_data'] = input_data

        # Compile and execute the code
        byte_code = compile_restricted(
            code,
            '<inline>',
            'exec'
        )
        
        # Execute in restricted environment
        with contextlib.redirect_stdout(output):
            exec(byte_code, restricted_globals, safe_locals)
        
        return {
            'output': output.getvalue(),
            'error': '',
            'exitCode': 0
        }
    except Exception as e:
        return {
            'error': str(e),
            'exitCode': 1
        }

def handler(event):
    """Main handler function for Cerebrium."""
    try:
        # Parse input
        body = event.get('body', {})
        if isinstance(body, str):
            body = json.loads(body)
            
        code = body.get('code')
        language = body.get('language', 'python')
        input_data = body.get('input')
        
        if not code:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Code is required'
                })
            }
        
        # Only support Python for now
        if language != 'python':
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Only Python is supported at this time'
                })
            }
        
        # Execute code
        result = run_python(code, input_data)
        
        # Format response
        response = {
            'output': result.get('output', ''),
            'error': result.get('error', ''),
            'exitCode': result.get('exitCode', 1)
        }
        
        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }
        
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'Server error: {str(e)}'
            })
        } 