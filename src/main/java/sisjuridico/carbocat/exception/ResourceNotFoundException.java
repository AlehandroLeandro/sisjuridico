package sisjuridico.carbocat.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException byId(Class<?> resourceClass, Object id){
        return byAttribute(resourceClass, "id", id);
    }

    private static ResourceNotFoundException byAttribute(Class<?> resourceClass, String attribute, Object value) {
        return new ResourceNotFoundException(
                resourceClass.getSimpleName()
                + " not found with "
                + attribute
                + ": "
                + value
        );
    }

}
