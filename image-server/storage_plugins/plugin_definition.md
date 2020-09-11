# Storage plugin defnition

The plugin should return two functions:

* getWritableStream()
* getReadableStream(id)

## getWritableStream()

Must return a tuple of [ err, writableStream ].
If err is null, writeableStream must be a writeable stream object that will represent a new binary blob.
The writableStream object must also provide a `.getID()` method that will define the id of the binary blob, such that it can be used later as the id argument of `getReadableStream(id)` to retrieve the binary blob
The id returned from `.getID()` must be a string and must uniquely identify the newly created binary blob. It may hold any internal structure other than that.

## getReadableStream(id)

Must return a tuple of [ err, readableStream ].
If err is null readableStream must be readable stream object of the binary blob represented by the the provided id.
If the provided id does not represent a binary blob that exists in storage, err must be an error type object, such that err.code is set to "ENOENT".
