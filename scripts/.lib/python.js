// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $ENHANCED_JAVA_ACCESS$
// note that this lib requires helper.js
// https://medini.freshdesk.com/support/discussions/topics/1000111607

/*
 * Usage-1: use a constructor, then run it later.
 * var my_python = new Py(src_path, py_path);
 * console.log(my_python.run());
 *
 * Usage-2: run the python script on the fly.
 * runPy(src_path, py_path);
 *
 * Note:
 * Omitting py_path is possible. Then your default python environment will be used.
 * If src_path without `.py` file extension, it will be treated as a python script directly.
 * For example, Py("print('hello world')") is executable.
 * */

function Py(src_path, py_path, arg_str) {
  if (!py_path) {
    py_path = "python";
  }

  if (!arg_str) {
    arg_str = "";
  }

  this.run = function () {
    if (src_path.slice(-3) == ".py") {
      return performCommand(
        [py_path, src_path].concat(arg_str.split(" "))
      ).join("\\n");
    } else {
      return performCommand([py_path, "-c", src_path]).join("\\n");
    }
  };
}

function runPy(src_path, py_path, arg_str) {
  var r = new Py(src_path, py_path, arg_str);
  return r.run();
}
